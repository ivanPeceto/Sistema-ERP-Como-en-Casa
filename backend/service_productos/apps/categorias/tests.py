from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth.models import User
from apps.categorias.models import Categoria
from types import SimpleNamespace

class CategoriaAPITestCase(APITestCase):

    def setUp(self):
        # Crear usuario administrador
        self.admin_user = User.objects.create_user(username='admin', password='admin123')

        # Simular el objeto rol con el atributo nombre
        self.admin_user.rol = SimpleNamespace(nombre='Administrador')
        self.admin_user.save()

        self.client = APIClient()
        self.client.force_authenticate(user=self.admin_user)

        # Crear categoría de prueba
        self.categoria = Categoria.objects.create(nombre="Electrónica")
        
        # URLs
        self.url_crear = reverse('categoria_crear')
        self.url_editar = reverse('categoria_editar')
        self.url_eliminar = reverse('categoria_eliminar')
        self.url_listar = reverse('categoria_listar')
        self.url_buscar = reverse('categoria_buscar')

    def test_crear_categoria(self):
        data = {'nombre': 'Ropa'}
        response = self.client.post(self.url_crear, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Categoria.objects.filter(nombre='Ropa').exists(), True)

    def test_editar_categoria(self):
        data = {'nombre': 'Electrónica y Gadgets'}
        response = self.client.put(f"{self.url_editar}?id={self.categoria.id}", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.categoria.refresh_from_db()
        self.assertEqual(self.categoria.nombre, 'Electrónica y Gadgets')

    def test_eliminar_categoria(self):
        response = self.client.post(f"{self.url_eliminar}?id={self.categoria.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Categoria.objects.filter(id=self.categoria.id).exists())

    def test_listar_categorias(self):
        response = self.client.get(self.url_listar)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_buscar_categoria_por_nombre(self):
        response = self.client.get(f"{self.url_buscar}?nombre=Electrónica")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(cat['nombre'] == 'Electrónica' for cat in response.data))

    def test_buscar_categoria_por_id(self):
        response = self.client.get(f"{self.url_buscar}?id={self.categoria.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['id'], self.categoria.id)

    def test_crear_categoria_datos_invalidos(self):
        response = self.client.post(self.url_crear, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_categoria_id_faltante(self):
        data = {'nombre': 'Electrónica y Gadgets'}
        response = self.client.put(self.url_editar, data)  # no pasa id en query
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Falta proporcionar el id', response.data['detail'])

    def test_editar_categoria_inexistente(self):
        data = {'nombre': 'Inexistente'}
        response = self.client.put(f"{self.url_editar}?id=9999", data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('No Categoria matches the given query.', str(response.data['detail']))


    def test_editar_categoria_datos_invalidos(self):
        data = {'nombre': ''}  
        response = self.client.put(f"{self.url_editar}?id={self.categoria.id}", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_eliminar_categoria_id_faltante(self):
        response = self.client.post(self.url_eliminar)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Falta proporcionar', response.data['detail'])

    def test_eliminar_categoria_inexistente(self):
        response = self.client.post(f"{self.url_eliminar}?id=9999")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('no encontrada', response.data['detail'])

    def test_buscar_categoria_sin_parametros(self):
        response = self.client.get(self.url_buscar)  # no pasa id ni nombre
        response.render()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Falta proporcionar', response.data['detail'])