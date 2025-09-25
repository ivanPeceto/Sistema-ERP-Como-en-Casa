from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import MetodoCobro
from rest_framework_simplejwt.tokens import AccessToken

class MetodoCobroAPITestCase(TestCase):
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
        
        # Creamos un método de cobro de prueba para usar en los tests de editar, eliminar y buscar
        self.metodo_de_prueba = MetodoCobro.objects.create(
            nombre="Efectivo"
        )

    def test_crear_metodo_de_cobro_autenticado(self):
        """Prueba la creación de un método de cobro con un usuario regular autenticado."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.superuser_token}')
        data = {"nombre": "Crédito"}
        response = self.client.post('/api/cobros/metodos/crear/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_listar_metodo_de_cobro_autenticado(self):
        """Prueba que un usuario regular pueda listar los métodos de cobro."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/cobros/metodos/listar/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_editar_metodo_de_cobro_como_superuser(self):
        """Prueba que un superusuario SÍ PUEDE editar un método de cobro."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.superuser_token}')
        data = {"nombre": "Transferencia"}
        url = f"/api/cobros/metodos/editar/?id={self.metodo_de_prueba.id}"
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificamos que el nombre se haya actualizado en la BD
        self.metodo_de_prueba.refresh_from_db()
        self.assertEqual(self.metodo_de_prueba.nombre, "Transferencia")

    def test_editar_metodo_de_cobro_como_regular_user_falla(self):
        """Prueba que un usuario regular NO PUEDE editar un método de cobro."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        data = {"nombre": "Débito"}
        url = f"/api/cobros/metodos/editar/?id={self.metodo_de_prueba.id}"
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_eliminar_metodo_de_cobro_como_superuser(self):
        """Prueba que un superusuario SÍ PUEDE eliminar un método de cobro."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.superuser_token}')
        url = f"/api/cobros/metodos/eliminar/?id={self.metodo_de_prueba.id}"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(MetodoCobro.objects.count(), 0)

    def test_eliminar_metodo_de_cobro_como_regular_user_falla(self):
        """Prueba que un usuario regular NO PUEDE eliminar un método de cobro."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        url = f"/api/cobros/metodos/eliminar/?id={self.metodo_de_prueba.id}"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_buscar_metodo_de_cobro_por_nombre(self):
        """Prueba la búsqueda de un método de cobro por su nombre."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_user_token}')
        response = self.client.get('/api/cobros/metodos/buscar/?nombre=Efectivo')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Efectivo')





