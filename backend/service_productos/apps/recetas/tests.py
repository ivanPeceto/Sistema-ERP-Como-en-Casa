from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from types import SimpleNamespace
from apps.insumos.models import Insumo
from apps.recetas.models import Receta, RecetaInsumo
from django.urls import reverse

class RecetaAPITestCase(TestCase):
    def setUp(self):
        # =============================
        # Crear usuarios con rol simulado
        # =============================
        self.admin_user = User.objects.create_user(username='admin', password='admin123')
        self.admin_user.rol = SimpleNamespace(nombre='Administrador')  # Simular atributo rol

        self.cocinero_user = User.objects.create_user(username='cocinero', password='cocinero123')
        self.cocinero_user.rol = SimpleNamespace(nombre='Cocinero')

        self.cliente_user = User.objects.create_user(username='cliente', password='cliente123')
        self.cliente_user.rol = SimpleNamespace(nombre='Cliente')

        # =============================
        # Configurar clientes API
        # =============================
        self.client_admin = APIClient()
        self.client_admin.force_authenticate(user=self.admin_user)

        self.client_cocinero = APIClient()
        self.client_cocinero.force_authenticate(user=self.cocinero_user)

        self.client_cliente = APIClient()
        self.client_cliente.force_authenticate(user=self.cliente_user)

        # =============================
        # Definir URLs
        # =============================
        self.url_crear = reverse('receta_crear')
        self.url_editar = reverse('receta_editar')
        self.url_eliminar = reverse('receta_eliminar')
        self.url_listar = reverse('receta_listar')
        self.url_buscar = reverse('receta_buscar')

        # =============================
        # Crear insumos
        # =============================
        self.insumo1 = Insumo.objects.create(
            nombre='Harina', unidad_medida='kg', stock_actual=100, costo_unitario=10.50
        )
        self.insumo2 = Insumo.objects.create(
            nombre='Azúcar', unidad_medida='kg', stock_actual=50, costo_unitario=8.75
        )

        # =============================
        # Crear receta de prueba
        # =============================
        self.receta = Receta.objects.create(
            nombre='Pastel de prueba', descripcion='Receta de pastel simple'
        )
        RecetaInsumo.objects.create(receta=self.receta, insumo=self.insumo1, cantidad=2.0)
        RecetaInsumo.objects.create(receta=self.receta, insumo=self.insumo2, cantidad=1.5)

    # =====================================================
    # ✅ CASOS DE ÉXITO
    # =====================================================

    def test_crear_receta_valida(self):
        """Crea una receta con usuario Administrador"""
        data = {
            'nombre': 'Bizcocho',
            'descripcion': 'Bizcocho casero',
            'insumos_data': [
                {'insumo_id': self.insumo1.id, 'cantidad': 2.0},
                {'insumo_id': self.insumo2.id, 'cantidad': 1.0}
            ]
        }
        response = self.client_admin.post(self.url_crear, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Receta.objects.filter(nombre='Bizcocho').exists())

    def test_editar_receta_existente(self):
        """Edita una receta existente"""
        data = {
            'nombre': 'Pan Integral',
            'descripcion': 'Pan más saludable',
            'insumos_data': [{'insumo_id': self.insumo1.id, 'cantidad': 2.0}]
        }
        response = self.client_cocinero.put(f"{self.url_editar}?id={self.receta.id}", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.receta.refresh_from_db()
        self.assertEqual(self.receta.nombre, 'Pan Integral')
        self.assertEqual(self.receta.recetainsumo_set.count(), 1)

    def test_eliminar_receta_existente(self):
        """Elimina una receta existente"""
        response = self.client_admin.post(f"{self.url_eliminar}?id={self.receta.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Receta.objects.filter(id=self.receta.id).exists())

    def test_listar_recetas(self):
        """Lista todas las recetas"""
        response = self.client_cocinero.get(self.url_listar)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_buscar_receta_por_nombre(self):
        """Busca una receta por nombre"""
        response = self.client_cocinero.get(f"{self.url_buscar}?nombre=Pastel")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any('Pastel' in r['nombre'] for r in response.data))

    # =====================================================
    # ❌ CASOS DE ERROR
    # =====================================================

    def test_crear_receta_invalida(self):
        """Error al crear receta sin insumos"""
        data = {'nombre': 'Bizcocho'}
        response = self.client_admin.post(self.url_crear, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_receta_sin_id(self):
        """Error al editar sin pasar ID"""
        data = {'nombre': 'Receta Nueva', 'insumos_data': []}
        response = self.client_cocinero.put(self.url_editar, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Falta proporcionar', response.data['detail'])

    def test_editar_receta_inexistente(self):
        """Error al editar receta que no existe"""
        data = {'nombre': 'Falso', 'insumos_data': []}
        response = self.client_cocinero.put(f"{self.url_editar}?id=9999", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('no encontrada', response.data['detail'])

    def test_eliminar_receta_id_faltante(self):
        """Error al eliminar sin ID"""
        response = self.client_admin.post(self.url_eliminar)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Falta proporcionar', response.data['detail'])

    def test_eliminar_receta_inexistente(self):
        """Error al eliminar receta que no existe"""
        response = self.client_admin.post(f"{self.url_eliminar}?id=9999")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('no encontrada', response.data['detail'])

    def test_buscar_receta_sin_parametros(self):
        """Error al buscar sin filtros"""
        response = self.client_cocinero.get(self.url_buscar)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    # =====================================================
    # 🔒 CASOS DE PERMISOS
    # =====================================================

    def test_crear_receta_sin_permiso(self):
        """Usuario Cliente intenta crear receta"""
        data = {'nombre': 'Torta', 'insumos_data': [{'insumo_id': self.insumo1.id, 'cantidad': 1}]}
        response = self.client_cliente.post(self.url_crear, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_editar_receta_sin_permiso(self):
        """Usuario Cliente intenta editar receta"""
        data = {'nombre': 'Pan Dulce', 'insumos_data': []}
        response = self.client_cliente.put(f"{self.url_editar}?id={self.receta.id}", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_eliminar_receta_sin_permiso(self):
        """Usuario Cliente intenta eliminar receta"""
        response = self.client_cliente.post(f"{self.url_eliminar}?id={self.receta.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
