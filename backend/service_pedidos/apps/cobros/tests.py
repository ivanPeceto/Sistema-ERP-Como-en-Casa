from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from datetime import date, time
from apps.cobros.models import Cobro
from apps.metodos.models import MetodoCobro
from apps.pedidos.models import Pedido
from apps.pedidosProductos.models import PedidoProductos

class CobroCrearTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Token para autenticación
        token = AccessToken()
        token['user_id'] = 1
        token['email'] = 'test@example.com'
        token['nombre'] = 'Usuario Test'
        token['is_superuser'] = True
        token['roles'] = ['Administrador']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Crear MetodoCobro
        self.metodo_cobro = MetodoCobro.objects.create(nombre="Efectivo")

        # Crear Pedido
        self.pedido = Pedido.objects.create(
            numero_pedido=123,
            fecha_pedido=date.today(),
            id_cliente=1,
            cliente="Cliente de prueba",
            para_hora=time(12, 0),
            estado="PENDIENTE",
            entregado=False,
            avisado=False,
            pagado=False,
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
        # Total del pedido = (2*100) + (1*300) = 500.00

    def test_crear_cobro_correctamente(self):
        data = {
            "pedido": self.pedido.id,
            "id_metodo_cobro": self.metodo_cobro.id,
            "descuento": 50.00,
            "recargo": 25.00
        }
        url = reverse('crear_cobro')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)

        cobro_creado = Cobro.objects.get(pedido=self.pedido)
        self.assertEqual(float(cobro_creado.monto), 475.00)
        self.assertEqual(cobro_creado.moneda, "ARS")

    def test_listar_cobros(self):
        Cobro.objects.create(
            pedido=self.pedido,
            id_metodo_cobro=self.metodo_cobro,
            monto=100,
            moneda='ARS',
            descuento=0,
            recargo=0
        )
        url = reverse('cobros')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_detalle_cobro(self):
        cobro = Cobro.objects.create(
            pedido=self.pedido,
            id_metodo_cobro=self.metodo_cobro,
            monto=100,
            moneda='ARS',
            descuento=0,
            recargo=0
        )
        url = f"{reverse('detalle_cobro')}?id={cobro.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], cobro.id)

    def test_editar_cobro(self):
        cobro = Cobro.objects.create(
            pedido=self.pedido,
            id_metodo_cobro=self.metodo_cobro,
            monto=100,
            moneda='ARS',
            descuento=0,
            recargo=0
        )
        data = {"pedido": self.pedido.id, "id_metodo_cobro": self.metodo_cobro.id, "descuento": 20, "recargo": 10}
        url = f"{reverse('editar_cobro')}?id={cobro.id}"
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cobro.refresh_from_db()
        self.assertEqual(float(cobro.descuento), 20.0)
        self.assertEqual(float(cobro.recargo), 10.0)

    def test_eliminar_cobro(self):
        cobro = Cobro.objects.create(
            pedido=self.pedido,
            id_metodo_cobro=self.metodo_cobro,
            monto=100,
            moneda='ARS',
            descuento=0,
            recargo=0
        )
        url = f"{reverse('eliminar_cobro')}?id={cobro.id}"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Cobro.objects.filter(pk=cobro.id).exists())

    def test_detalle_sin_id(self):
        url = reverse('detalle_cobro')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_cobro_no_existe(self):
        url = f"{reverse('editar_cobro')}?id=999"
        response = self.client.put(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_eliminar_cobro_no_existe(self):
        url = f"{reverse('eliminar_cobro')}?id=999"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Tests de pagos parciales/múltiples
    def test_pago_parcial_no_completa_pedido(self):
        data = {"pedido": self.pedido.id, "id_metodo_cobro": self.metodo_cobro.id, "descuento": 0, "recargo": 0, "monto": 200}
        url = reverse('crear_cobro')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.pedido.refresh_from_db()
        self.assertFalse(self.pedido.pagado)
        cobro = Cobro.objects.get(pedido=self.pedido)
        self.assertEqual(float(cobro.monto), 200.0)

    def test_pago_total_completa_pedido(self):
        url = reverse('crear_cobro')
        self.client.post(url, {"pedido": self.pedido.id, "id_metodo_cobro": self.metodo_cobro.id, "monto": 300, "descuento": 0, "recargo": 0}, format='json')
        response = self.client.post(url, {"pedido": self.pedido.id, "id_metodo_cobro": self.metodo_cobro.id, "monto": 200, "descuento": 0, "recargo": 0}, format='json')
        self.assertEqual(response.status_code, 201)
        self.pedido.refresh_from_db()
        self.assertTrue(self.pedido.pagado)

    def test_pago_excede_total_falla(self):
        Cobro.objects.create(pedido=self.pedido, id_metodo_cobro=self.metodo_cobro, monto=400.0, moneda='ARS', descuento=0, recargo=0)
        data = {"pedido": self.pedido.id, "id_metodo_cobro": self.metodo_cobro.id, "monto": 200, "descuento": 0, "recargo": 0}
        url = reverse('crear_cobro')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('monto', response.data)

    def test_response_incluye_estado_pago(self):
        data = {"pedido": self.pedido.id, "id_metodo_cobro": self.metodo_cobro.id, "monto": 500, "descuento": 0, "recargo": 0}
        url = reverse('crear_cobro')
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('monto_restante', response.data)
        self.assertIn('pagado_completo', response.data)
        self.assertEqual(float(response.data['monto_restante']), 0.0)
        self.assertTrue(response.data['pagado_completo'])
