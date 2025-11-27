from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth.models import User
from types import SimpleNamespace
from apps.insumos.models import Insumo


class InsumoAPITestCase(APITestCase):
    """!
    @brief Casos de prueba para las vistas del módulo de Insumos.
    """

    def setUp(self):
        """!
        @brief Configura el entorno antes de cada prueba.
        """
        # Usuario administrador con rol permitido
        self.admin_user = User.objects.create_user(username='admin', password='admin123')
        self.admin_user.rol = SimpleNamespace(nombre='Administrador')

        # Usuario no autorizado (rol Cliente)
        self.cliente_user = User.objects.create_user(username='cliente', password='cliente123')
        self.cliente_user.rol = SimpleNamespace(nombre='Cliente')

        # Cliente HTTP
        self.client = APIClient()

        # Crear insumo de prueba con todos los campos obligatorios
        self.insumo = Insumo.objects.create(
            nombre='Harina',
            descripcion='Harina de trigo',
            unidad_medida='kg',
            stock_actual=100.00,
            costo_unitario=5.50
        )

        # URLs
        self.url_crear = reverse('insumo_crear')
        self.url_editar = reverse('insumo_editar')
        self.url_eliminar = reverse('insumo_eliminar')
        self.url_listar = reverse('insumo_listar')
        self.url_buscar = reverse('insumo_buscar')

    # =====================================================
    # CASOS DE ÉXITO - USUARIO CON ROL PERMITIDO
    # =====================================================

    def test_crear_insumo_valido(self):
        """Crea un insumo con usuario administrador"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'nombre': 'Azúcar',
            'descripcion': 'Azúcar refinada',
            'unidad_medida': 'kg',
            'stock_actual': 50.00,
            'costo_unitario': 3.25
        }
        response = self.client.post(self.url_crear, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Insumo.objects.filter(nombre='Azúcar').exists())

    def test_editar_insumo_existente(self):
        """Edita un insumo existente"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'nombre': 'Harina Integral',
            'descripcion': 'Harina orgánica',
            'unidad_medida': 'kg',
            'stock_actual': 90.00,
            'costo_unitario': 6.00
        }
        response = self.client.put(f"{self.url_editar}?id={self.insumo.id}", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('exitosamente', response.data['detail'])
        self.insumo.refresh_from_db()
        self.assertEqual(self.insumo.nombre, 'Harina Integral')

    def test_eliminar_insumo_existente(self):
        """Elimina un insumo existente"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f"{self.url_eliminar}?id={self.insumo.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('exitosamente', response.data['detail'])
        self.assertFalse(Insumo.objects.filter(id=self.insumo.id).exists())

    def test_listar_insumos(self):
        """Lista todos los insumos"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url_listar)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_buscar_insumo_por_nombre(self):
        """Busca un insumo por nombre"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f"{self.url_buscar}?nombre=Harina")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any('Harina' in i['nombre'] for i in response.data))

    # =====================================================
    # CASOS DE ERROR - USUARIO CON ROL PERMITIDO
    # =====================================================

    def test_crear_insumo_invalido(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.url_crear, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_insumo_id_faltante(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'nombre': 'Harina Blanca'}
        response = self.client.put(self.url_editar, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Falta proporcionar', response.data['detail'])

    def test_editar_insumo_inexistente(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'nombre': 'Producto Fantasma',
            'descripcion': 'No existe',
            'unidad_medida': 'kg',
            'stock_actual': 10,
            'costo_unitario': 2.5
        }
        response = self.client.put(f"{self.url_editar}?id=9999", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('no encontrado', response.data['detail'])

    def test_eliminar_insumo_id_faltante(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.url_eliminar)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Falta proporcionar', response.data['detail'])

    def test_eliminar_insumo_inexistente(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f"{self.url_eliminar}?id=9999")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('no encontrado', response.data['detail'])

    def test_buscar_insumo_sin_parametros(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url_buscar)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    # =====================================================
    # CASOS DE PERMISOS - USUARIO CON ROL NO AUTORIZADO
    # =====================================================

    def test_crear_insumo_sin_permiso(self):
        """Usuario Cliente intenta crear insumo"""
        self.client.force_authenticate(user=self.cliente_user)
        data = {
            'nombre': 'Mantequilla',
            'descripcion': 'Producto lácteo',
            'unidad_medida': 'kg',
            'stock_actual': 30.00,
            'costo_unitario': 4.20
        }
        response = self.client.post(self.url_crear, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_editar_insumo_sin_permiso(self):
        """Usuario Cliente intenta editar insumo"""
        self.client.force_authenticate(user=self.cliente_user)
        data = {
            'nombre': 'Harina Especial',
            'unidad_medida': 'kg',
            'stock_actual': 80.00,
            'costo_unitario': 5.80
        }
        response = self.client.put(f"{self.url_editar}?id={self.insumo.id}", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_eliminar_insumo_sin_permiso(self):
        """Usuario Cliente intenta eliminar insumo"""
        self.client.force_authenticate(user=self.cliente_user)
        response = self.client.post(f"{self.url_eliminar}?id={self.insumo.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
