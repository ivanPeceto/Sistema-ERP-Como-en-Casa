from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.insumos.models import Insumo
from .models import Receta, RecetaInsumo
from rest_framework_simplejwt.tokens import AccessToken

class RecetaAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Creamos un token para un SUPERUSUARIO
        self.superuser_token = AccessToken()
        self.superuser_token['user_id'] = 1
        self.superuser_token['is_superuser'] = True

        # Creamos un token para un USUARIO REGULAR
        self.regular_user_token = AccessToken()
        self.regular_user_token['user_id'] = 2
        self.regular_user_token['is_superuser'] = False
        
        self.insumo1 = Insumo.objects.create(nombre="Harina", unidad_medida="kg", stock_actual="50", costo_unitario="200")
        self.insumo2 = Insumo.objects.create(nombre="Tomate", unidad_medida="kg", stock_actual="20", costo_unitario="450")
        
        self.receta_de_prueba = Receta.objects.create(nombre="Masa Base", descripcion="Masa para pizza")
        RecetaInsumo.objects.create(receta=self.receta_de_prueba, insumo=self.insumo1, cantidad=1.0)
    
    def test_crear_receta_autenticado(self):
        """Prueba la creación de una receta con un usuario regular autenticado."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        data = { "nombre": "Salsa Roja", "insumos_data": [{"insumo_id": self.insumo2.id, "cantidad": "2.5"}] }
        response = self.client.post('/api/productos/receta/crear/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Salsa Roja')
    
    def test_listar_recetas_autenticado(self):
        """Prueba que un usuario regular pueda listar las recetas."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/productos/receta/listar/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_editar_receta_como_superuser(self):
        """Prueba que un superusuario SÍ PUEDE editar una receta."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.superuser_token}')
        data = { "nombre": "Masa Base Mejorada", "insumos_data": [{"insumo_id": self.insumo1.id, "cantidad": "1.2"}]}
        url = f"/api/productos/receta/editar/?id={self.receta_de_prueba.id}"
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.receta_de_prueba.refresh_from_db()
        self.assertEqual(self.receta_de_prueba.nombre, "Masa Base Mejorada")
    
    def test_editar_receta_como_regular_user_falla(self):
        """Prueba que un usuario regular NO PUEDE editar una receta."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        data = { "nombre": "Masa Base Mejorada", "insumos_data": [{"insumo_id": self.insumo1.id, "cantidad": "1.2"}]}
        url = f"/api/productos/receta/editar/?id={self.receta_de_prueba.id}"
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_eliminar_receta_como_superuser(self):
        """Prueba que un superusuario SÍ PUEDE eliminar una receta."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.superuser_token}')
        url = f"/api/productos/receta/eliminar/?id={self.receta_de_prueba.id}"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Receta.objects.count(), 0)

    def test_eliminar_receta_como_regular_user_falla(self):
        """Prueba que un usuario regular NO PUEDE eliminar una receta."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        url = f"/api/productos/receta/eliminar/?id={self.receta_de_prueba.id}"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_buscar_receta_por_nombre(self):
        """Prueba la búsqueda de una receta por su nombre."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/productos/receta/buscar/?nombre=Masa')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Masa Base')