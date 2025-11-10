from django.test import TestCase
from rest_framework.test import APIClient
from unittest.mock import MagicMock
from django.utils import timezone
from apps.pedidos.models import Pedido
from apps.pedidosProductos.models import PedidoProductos
from django.urls import reverse
from rest_framework import status

class PedidoViewsMicroserviceUserTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        # Mock usuario de microservicio
        self.mock_user = MagicMock()
        self.mock_user.is_authenticated = True
        self.mock_user.rol = MagicMock()
        self.mock_user.rol.nombre = 'Administrador'
        self.client.force_authenticate(user=self.mock_user)

        # Crear un pedido de prueba
        self.pedido = Pedido.objects.create(
            numero_pedido=1,
            id_cliente=1,
            cliente="Juan Perez",
            fecha_pedido=timezone.now(),
            para_hora="14:30:00",
            estado=Pedido.ESTADO_PENDIENTE,
            entregado=False,
            avisado=False,
            pagado=False
        )

    def test_create_pedido_success(self):
        """Test para crear un pedido con productos exitosamente"""
        url = reverse('crear_pedido')  
        payload = {
            "numero_pedido": 2,
            "fecha_pedido": "2025-11-10T08:01:18",
            "id_cliente": 1,
            "cliente": "MARIA LOPEZ",
            "para_hora": "15:00:00",
            "estado": "PENDIENTE",
            "entregado": False,
            "avisado": False,
            "pagado": False,
            "productos": [
                {
                    "id_producto": 1,
                    "nombre_producto": "Producto A",
                    "cantidad_producto": 2,
                    "precio_unitario": 100,
                    "aclaraciones": "Sin salsa"
                },
                {
                    "id_producto": 2,
                    "nombre_producto": "Producto B",
                    "cantidad_producto": 1,
                    "precio_unitario": 50,
                    "aclaraciones": ""
                }
            ]
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Pedido.objects.count(), 2)
        self.assertEqual(PedidoProductos.objects.filter(id_pedido=response.data['id']).count(), 2)
    
    def test_edit_pedido_success(self):
        """Test para editar un pedido existente"""
        url_base = reverse('editar_pedido')
        url = f"{url_base}?id={self.pedido.id}&fecha={self.pedido.fecha_pedido.date()}&numero={self.pedido.numero_pedido}"
        payload = {
            "numero_pedido": self.pedido.numero_pedido,
            "fecha_pedido": self.pedido.fecha_pedido.isoformat(),
            "id_cliente": 1,
            "cliente": "JUAN PEREZ",
            "para_hora": "16:00:00",
            "estado": "ENTREGADO",
            "entregado": False,
            "avisado": False,
            "pagado": True,
            "productos": [
                {
                    "id_producto": 3,
                    "nombre_producto": "Producto C",
                    "cantidad_producto": 3,
                    "precio_unitario": 70,
                    "aclaraciones": ""
                }
            ]
        }
        response = self.client.put(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.pedido.refresh_from_db()
        self.assertEqual(self.pedido.para_hora.strftime("%H:%M:%S"), "16:00:00")
        self.assertEqual(PedidoProductos.objects.filter(id_pedido=self.pedido.id).count(), 1)

    def test_delete_pedido_success(self):
        url = reverse('eliminar_pedido') + f"?fecha={self.pedido.fecha_pedido.date()}&numero={self.pedido.numero_pedido}"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Pedido.objects.filter(id=self.pedido.id).exists())

    def test_imprimir_pedido_success(self):
        url = reverse('imprimir_pedido') + f"?fecha={self.pedido.fecha_pedido.date()}&numero={self.pedido.numero_pedido}"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)  # Mensaje de éxito o error de impresión

    def test_list_pedido_success(self):
        url = reverse('pedidos') + f"?fecha={self.pedido.fecha_pedido.date()}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
    
    def test_edit_pedido_missing_fecha(self):
        url = reverse('editar_pedido') + f"?numero={self.pedido.numero_pedido}&id={self.pedido.id}"
        payload = {"numero_pedido": 1}
        response = self.client.put(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_edit_pedido_invalid_fecha_format(self):
        url = reverse('editar_pedido') + "?fecha=2025-99-99&numero=1&id=1"
        payload = {"numero_pedido": 1}
        response = self.client.put(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_edit_pedido_not_found(self):
        url = reverse('editar_pedido') + "?fecha=2025-11-10&numero=999&id=999"
        payload = {"numero_pedido": 999}
        response = self.client.put(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('detail', response.data)

    def test_delete_pedido_missing_numero(self):
        url = reverse('eliminar_pedido') + f"?fecha={self.pedido.fecha_pedido.date()}"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_imprimir_pedido_not_found(self):
        url = reverse('imprimir_pedido') + "?fecha=2025-11-10&numero=999&id=999"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('detail', response.data)

    # ---------- Tests de permisos ----------

    def test_access_without_authentication(self):
        self.client.force_authenticate(user=None)
        url = reverse('pedidos') + f"?fecha={self.pedido.fecha_pedido.date()}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_pedido_role_not_allowed(self):
        # Mock usuario con rol no permitido
        self.mock_user.rol.nombre = 'Cliente'
        self.client.force_authenticate(user=self.mock_user)
        url = reverse('crear_pedido')
        payload = {"numero_pedido": 2, "fecha_pedido": "2025-11-10T08:01:18", "id_cliente": 1, "cliente": "MARIA LOPEZ",
                   "para_hora": "15:00:00", "estado": "PENDIENTE", "entregado": False, "avisado": False, "pagado": False, "productos": []}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)