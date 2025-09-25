#/backend/service_pedidos/apps/cobros/tests.py

from django.test import TestCase
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
            # "moneda" se omite porque tiene valor por defecto ("ARS")
        }

        response = self.client.post('/api/cobros/crear/', data, format='json')
        self.assertEqual(response.status_code, 201)

        cobro_creado = Cobro.objects.get(pedido=self.pedido)

        # Subtotal viene del pedido (500.00)
        # Monto esperado: 500.00 - 50.00 + 25.00 = 475.00
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
        response = self.client.get("/api/cobros/listar/")
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
        response = self.client.get(f"/api/cobros/detalle/?id={cobro.id}")
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
        data = {
            "pedido": self.pedido.id,
            "id_metodo_cobro": self.metodo_cobro.id,
            "descuento": 20,
            "recargo": 10
        }
        response = self.client.put(f"/api/cobros/editar/?id={cobro.id}", data, format='json')
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
        response = self.client.delete(f"/api/cobros/eliminar/?id={cobro.id}")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Cobro.objects.filter(pk=cobro.id).exists())

    def test_detalle_sin_id(self):
        response = self.client.get("/api/cobros/detalle/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_cobro_no_existe(self):
        response = self.client.put("/api/cobros/editar/?id=999", {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_eliminar_cobro_no_existe(self):
        response = self.client.delete("/api/cobros/eliminar/?id=999")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    #TESTS PARA PAGOS PARCIALES/MÚLTIPLES

    def test_pago_parcial_no_completa_pedido(self):
        #Test: crear un cobro parcial, el pedido NO se marca como pagado.
        data = {
            "pedido": self.pedido.id,
            "id_metodo_cobro": self.metodo_cobro.id,
            "descuento": 0,
            "recargo": 0,
            "monto": 200  # pago parcial
        }

        response = self.client.post('/api/cobros/crear/', data, format='json')
        self.assertEqual(response.status_code, 201)

        self.pedido.refresh_from_db()
        self.assertFalse(self.pedido.pagado)

        cobro = Cobro.objects.get(pedido=self.pedido)
        self.assertEqual(float(cobro.monto), 200.00)

    def test_pago_total_completa_pedido(self):
        #Test: se realizan dos cobros que en total completan el pago del pedido.
        self.client.post('/api/cobros/crear/', {
            "pedido": self.pedido.id,
            "id_metodo_cobro": self.metodo_cobro.id,
            "monto": 300,
            "descuento": 0,
            "recargo": 0
        }, format='json')

        response = self.client.post('/api/cobros/crear/', {
            "pedido": self.pedido.id,
            "id_metodo_cobro": self.metodo_cobro.id,
            "monto": 200,
            "descuento": 0,
            "recargo": 0
        }, format='json')

        self.assertEqual(response.status_code, 201)

        self.pedido.refresh_from_db()
        self.assertTrue(self.pedido.pagado)

    def test_pago_excede_total_falla(self):
        #Test: intentar un cobro que excede el monto total del pedido (debe fallar).
        Cobro.objects.create(
            pedido=self.pedido,
            id_metodo_cobro=self.metodo_cobro,
            monto=400.00,
            moneda='ARS',
            descuento=0,
            recargo=0
        )

        data = {
            "pedido": self.pedido.id,
            "id_metodo_cobro": self.metodo_cobro.id,
            "monto": 200,  # excede, total sería 600 pero subtotal es 500
            "descuento": 0,
            "recargo": 0
        }

        response = self.client.post('/api/cobros/crear/', data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('monto', response.data)

    def test_response_incluye_estado_pago(self):
        #Test: la respuesta del endpoint incluye monto_restante y pagado_completo.
        data = {
            "pedido": self.pedido.id,
            "id_metodo_cobro": self.metodo_cobro.id,
            "monto": 500,  # pagar todo de una
            "descuento": 0,
            "recargo": 0
        }
        response = self.client.post('/api/cobros/crear/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('monto_restante', response.data)
        self.assertIn('pagado_completo', response.data)
        self.assertEqual(float(response.data['monto_restante']), 0.0)
        self.assertTrue(response.data['pagado_completo'])
