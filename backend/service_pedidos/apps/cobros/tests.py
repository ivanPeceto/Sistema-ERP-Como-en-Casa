from django.utils import timezone
from datetime import time
from decimal import Decimal

from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from django.contrib.auth import get_user_model
from apps.pedidos.models import Pedido, PedidoProductos
from apps.cobros.models import Cobro

User = get_user_model()

class CobroViewSetTests(APITestCase):
    def setUp(self):
        # Crear usuarios
        self.admin = User.objects.create_user(
            username="Administrador",
            email="admin@test.com",
            password="1234",
        )
        self.admin.rol = "Administrador"
        self.admin.save()

        self.recepcionista = User.objects.create_user(
            username="Recepcionista",
            email="recep@test.com",
            password="1234",
        )
        self.recepcionista.rol = "Recepcionista"
        self.recepcionista.save()

        self.otro_usuario = User.objects.create_user(
            username="Cliente",
            email="user@test.com",
            password="1234",
        )
        self.otro_usuario.rol = "Cliente"
        self.otro_usuario.save()

        self.client = APIClient()

        # Crear Pedido base
        self.pedido = Pedido.objects.create(
            numero_pedido=123,
            fecha_pedido=timezone.now(),
            id_cliente=1,
            cliente="Cliente de prueba",
            para_hora=time(12, 0),
            estado="PENDIENTE",
            entregado=False,
            avisado=False,
            pagado=False,
            total=500.00
        )

        # Crear productos asociados al pedido
        PedidoProductos.objects.create(
            id_pedido=self.pedido,
            id_producto=1,
            nombre_producto="Producto A",
            cantidad_producto=2,
            precio_unitario=100.00,
            aclaraciones=""
        )
        PedidoProductos.objects.create(
            id_pedido=self.pedido,
            id_producto=2,
            nombre_producto="Producto B",
            cantidad_producto=1,
            precio_unitario=300.00,
            aclaraciones=""
        )

    def test_create_cobro_efectivo_admin(self):
        """Debe permitir crear un cobro efectivo si usuario es Admin"""
        self.client.force_authenticate(user=self.admin)
        data = {
            "pedido": self.pedido.id,
            "tipo": "efectivo",
            "monto": 200,
            "descuento": 0,
            "recargo": 0
        }
        response = self.client.post("/api/pedidos/cobros/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Cobro.objects.count(), 1)
        self.assertEqual(Cobro.objects.first().monto, Decimal("200"))

    def test_create_cobro_sin_autenticacion(self):
        """Debe bloquear creación si no está autenticado"""
        self.client.force_authenticate(user=None)  # no autenticado
        data = {
            "pedido": self.pedido.id,
            "tipo": "efectivo",
            "monto": 100
        }
        response = self.client.post("/api/pedidos/cobros/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_cobro_recepcionista(self):
        """Debe permitir crear cobro si es Recepcionista"""
        self.client.force_authenticate(user=self.recepcionista)
        data = {
            "pedido": self.pedido.id,
            "tipo": "efectivo",
            "monto": 150
        }
        response = self.client.post("/api/pedidos/cobros/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_destroy_cobro_admin(self):
        """Debe permitir a Admin cancelar un cobro"""
        self.client.force_authenticate(user=self.admin)
        cobro = Cobro.objects.create(
            pedido=self.pedido,
            tipo="efectivo",
            monto=100,
            fecha=timezone.now(),
            estado="activo"
        )
        response = self.client.delete(f"/api/pedidos/cobros/{cobro.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        cobro.refresh_from_db()
        self.assertEqual(cobro.estado, "cancelado")

    def test_destroy_cobro_usuario_no_admin(self):
        """Debe bloquear eliminación si usuario no tiene rol Admin"""
        self.client.force_authenticate(user=self.recepcionista)
        cobro = Cobro.objects.create(
            pedido=self.pedido,
            tipo="efectivo",
            monto=100,
            fecha=timezone.now(),
            estado="activo"
        )
        response = self.client.delete(f"/api/pedidos/cobros/{cobro.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_cobro_admin(self):
        """Debe permitir actualizar cobro si es Admin"""
        self.client.force_authenticate(user=self.admin)
        cobro = Cobro.objects.create(
            pedido=self.pedido,
            tipo="efectivo",
            monto=100,
            fecha=timezone.now(),
            estado="activo"
        )
        data = {"monto": 150}
        response = self.client.put(f"/api/pedidos/cobros/{cobro.id}/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cobro.refresh_from_db()
        self.assertEqual(cobro.monto, Decimal("150"))

    def test_update_cobro_cancelado(self):
        """No se debe poder actualizar un cobro cancelado"""
        self.client.force_authenticate(user=self.admin)
        cobro = Cobro.objects.create(
            pedido=self.pedido,
            tipo="efectivo",
            monto=100,
            fecha=timezone.now(),
            estado="cancelado"
        )
        data = {"monto": 150}
        response = self.client.put(f"/api/pedidos/cobros/{cobro.id}/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
