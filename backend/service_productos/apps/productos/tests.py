from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth.models import User
from types import SimpleNamespace
from apps.productos.models import Producto
from apps.categorias.models import Categoria


class ProductoAPITestCase(APITestCase):
    """!
    @brief Casos de prueba para las vistas del módulo de Productos.
    """

    def setUp(self):
        """!
        @brief Configura el entorno antes de cada prueba.
        """

        # Usuarios con y sin permisos
        self.admin_user = User.objects.create_user(username='admin', password='admin123')
        self.admin_user.rol = SimpleNamespace(nombre='Administrador')

        self.recepcionista_user = User.objects.create_user(username='recepcionista', password='recep123')
        self.recepcionista_user.rol = SimpleNamespace(nombre='Recepcionista')

        self.cliente_user = User.objects.create_user(username='cliente', password='cliente123')
        self.cliente_user.rol = SimpleNamespace(nombre='Cliente')

        # Cliente HTTP
        self.client = APIClient()

        # Categoría necesaria para crear productos
        self.categoria = Categoria.objects.create(nombre='Bebidas', descripcion='Bebidas frías y calientes')

        # Producto de prueba
        self.producto = Producto.objects.create(
            nombre='Café',
            descripcion='Café tostado molido',
            precio_unitario=12.50,
            disponible=True,
            categoria=self.categoria
        )

        # URLs
        self.url_crear = reverse('producto_crear')
        self.url_editar = reverse('producto_editar')
        self.url_eliminar = reverse('producto_eliminar')
        self.url_listar = reverse('producto_listar')
        self.url_buscar = reverse('producto_buscar')

    # =====================================================
    # ✅ CASOS DE ÉXITO (Administrador o Recepcionista)
    # =====================================================

    def test_crear_producto_valido(self):
        """Crea un producto con usuario administrador"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'nombre': 'Té Verde',
            'descripcion': 'Té natural de hojas verdes',
            'precio_unitario': 8.75,
            'disponible': True,
            'categoria_id': self.categoria.id
        }
        response = self.client.post(self.url_crear, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Producto.objects.filter(nombre='Té Verde').exists())

    def test_editar_producto_existente(self):
        """Edita un producto existente"""
        self.client.force_authenticate(user=self.recepcionista_user)
        data = {
            'nombre': 'Café Espresso',
            'descripcion': 'Café fuerte y concentrado',
            'precio_unitario': 15.00,
            'disponible': True,
            'categoria_id': self.categoria.id
        }
        response = self.client.put(f"{self.url_editar}?id={self.producto.id}", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('exitosamente', response.data['detail'])
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.nombre, 'Café Espresso')

    def test_eliminar_producto_existente(self):
        """Elimina un producto existente"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f"{self.url_eliminar}?id={self.producto.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('exitosamente', response.data['detail'])
        self.assertFalse(Producto.objects.filter(id=self.producto.id).exists())

    def test_listar_productos(self):
        """Lista todos los productos"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url_listar)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_buscar_producto_por_nombre(self):
        """Busca un producto por nombre"""
        self.client.force_authenticate(user=self.recepcionista_user)
        response = self.client.get(f"{self.url_buscar}?nombre=Café")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any('Café' in i['nombre'] for i in response.data))

    # =====================================================
    # ❌ CASOS DE ERROR (Administrador o Recepcionista)
    # =====================================================

    def test_crear_producto_invalido(self):
        """Error al crear producto con datos vacíos"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.url_crear, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_producto_id_faltante(self):
        """Error al editar sin pasar ID"""
        self.client.force_authenticate(user=self.admin_user)
        data = {'nombre': 'Producto Nuevo'}
        response = self.client.put(self.url_editar, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Falta proporcionar', response.data['detail'])

    def test_editar_producto_inexistente(self):
        """Error al editar producto que no existe"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'nombre': 'Falso',
            'descripcion': 'Producto que no existe',
            'precio_unitario': 9.99,
            'disponible': True,
            'categoria': self.categoria.id
        }
        response = self.client.put(f"{self.url_editar}?id=9999", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('no encontrado', response.data['detail'])

    def test_eliminar_producto_id_faltante(self):
        """Error al eliminar sin ID"""
        self.client.force_authenticate(user=self.recepcionista_user)
        response = self.client.post(self.url_eliminar)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Falta proporcionar', response.data['detail'])

    def test_eliminar_producto_inexistente(self):
        """Error al eliminar producto que no existe"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f"{self.url_eliminar}?id=9999")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('no encontrado', response.data['detail'])

    def test_buscar_producto_sin_parametros(self):
        """Error al buscar sin filtros"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url_buscar)
        # Según tu vista, devuelve error 400 si no hay nombre o id
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Falta proporcionar', response.data['detail'])

    # =====================================================
    # 🔒 CASOS DE PERMISOS
    # =====================================================

    def test_crear_producto_sin_permiso(self):
        """Usuario Cliente intenta crear producto"""
        self.client.force_authenticate(user=self.cliente_user)
        data = {
            'nombre': 'Juguito',
            'descripcion': 'Natural',
            'precio_unitario': 3.00,
            'disponible': True,
            'categoria': self.categoria.id
        }
        response = self.client.post(self.url_crear, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_editar_producto_sin_permiso(self):
        """Usuario Cliente intenta editar producto"""
        self.client.force_authenticate(user=self.cliente_user)
        data = {
            'nombre': 'Café Especial',
            'descripcion': 'Mejorado',
            'precio_unitario': 13.50,
            'disponible': True,
            'categoria': self.categoria.id
        }
        response = self.client.put(f"{self.url_editar}?id={self.producto.id}", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_eliminar_producto_sin_permiso(self):
        """Usuario Cliente intenta eliminar producto"""
        self.client.force_authenticate(user=self.cliente_user)
        response = self.client.post(f"{self.url_eliminar}?id={self.producto.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
