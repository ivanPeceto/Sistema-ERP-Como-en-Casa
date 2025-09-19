from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Insumo
from rest_framework_simplejwt.tokens import AccessToken

class InsumoAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Creamos un token para un SUPERUSUARIO
        self.superuser_token = AccessToken()
        self.superuser_token['user_id'] = 1
        self.superuser_token['nombre'] = 'testsuperuser'
        self.superuser_token['is_superuser'] = True

        # Creamos un token para un USUARIO REGULAR
        self.regular_user_token = AccessToken()
        self.regular_user_token['user_id'] = 2
        self.regular_user_token['nombre'] = 'testregular'
        self.regular_user_token['is_superuser'] = False
        
        # Creamos un insumo de prueba para usar en los tests de editar, eliminar y buscar
        self.insumo_de_prueba = Insumo.objects.create(
            nombre="Queso Muzarella",
            unidad_medida="kg",
            stock_actual="10.00",
            costo_unitario="950.00"
        )

    def test_crear_insumo_autenticado(self):
        """Prueba la creación de un insumo con un usuario regular autenticado."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        data = {"nombre": "Harina 0000", "unidad_medida": "kg", "stock_actual": "25.50", "costo_unitario": "150.75"}
        response = self.client.post('/api/productos/insumo/crear/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_listar_insumos_autenticado(self):
        """Prueba que un usuario regular pueda listar los insumos."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/productos/insumo/listar/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_editar_insumo_como_superuser(self):
        """Prueba que un superusuario SÍ PUEDE editar un insumo."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.superuser_token}')
        data = {"nombre": "Queso Provolone", "unidad_medida": "kg", "stock_actual": "5.00", "costo_unitario": "1200.00"}
        url = f"/api/productos/insumo/editar/?id={self.insumo_de_prueba.id}"
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificamos que el nombre se haya actualizado en la BD
        self.insumo_de_prueba.refresh_from_db()
        self.assertEqual(self.insumo_de_prueba.nombre, "Queso Provolone")

    def test_editar_insumo_como_regular_user_falla(self):
        """Prueba que un usuario regular NO PUEDE editar un insumo."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        data = {"nombre": "Queso Provolone"}
        url = f"/api/productos/insumo/editar/?id={self.insumo_de_prueba.id}"
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_eliminar_insumo_como_superuser(self):
        """Prueba que un superusuario SÍ PUEDE eliminar un insumo."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.superuser_token}')
        url = f"/api/productos/insumo/eliminar/?id={self.insumo_de_prueba.id}"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Insumo.objects.count(), 0)

    def test_eliminar_insumo_como_regular_user_falla(self):
        """Prueba que un usuario regular NO PUEDE eliminar un insumo."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        url = f"/api/productos/insumo/eliminar/?id={self.insumo_de_prueba.id}"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_buscar_insumo_por_nombre(self):
        """Prueba la búsqueda de un insumo por su nombre."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/productos/insumo/buscar/?nombre=Muzarella')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Queso Muzarella')