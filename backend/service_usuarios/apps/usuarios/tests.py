from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from apps.roles.models import Rol
from apps.usuarios.models import Usuario


class UsuarioAPITestCase(APITestCase):

    def setUp(self):
        # Crear roles
        self.rol_admin = Rol.objects.create(nombre='Administrador')
        self.rol_recepcionista = Rol.objects.create(nombre='Recepcionista')
        self.rol_cocinero = Rol.objects.create(nombre='Cocinero')
        self.rol_usuario = Rol.objects.create(nombre='Usuario')

        # Crear usuarios
        self.admin_user = Usuario.objects.create_user(
            email='admin@test.com',
            nombre='Admin',
            password='admin123',
            rol=self.rol_admin
        )
        self.recepcionista_user = Usuario.objects.create_user(
            email='recep@test.com',
            nombre='Recepcionista',
            password='recep123',
            rol=self.rol_recepcionista
        )
        self.cocinero_user = Usuario.objects.create_user(
            email='cocinero@test.com',
            nombre='Cocinero',
            password='cocina123',
            rol=self.rol_cocinero
        )
        self.normal_user = Usuario.objects.create_user(
            email='user@test.com',
            nombre='Usuario',
            password='user123',
            rol=self.rol_usuario
        )

        # Usuario para CRUD
        self.user_test = Usuario.objects.create_user(
            email='test@test.com',
            nombre='UsuarioTest',
            password='test123',
            rol=self.rol_usuario
        )

    # ----------------------------------------------------------
    # LISTAR
    # ----------------------------------------------------------

    def test_listar_usuarios_admin(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('usuario_listar')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 4)

    def test_listar_usuarios_no_admin(self):
        for user in [self.recepcionista_user, self.cocinero_user, self.normal_user]:
            self.client.force_authenticate(user)
            url = reverse('usuario_listar')
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_listar_usuario_por_id(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('usuario_listar') + f'?id={self.user_test.id}'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_test.email)

    def test_listar_usuario_por_id_no_existente(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('usuario_listar') + '?id=999'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['detail'], 'Usuario no encontrado')

    # ----------------------------------------------------------
    # CREAR
    # ----------------------------------------------------------

    def test_crear_usuario_admin(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('usuario_crear')
        data = {
            'email': 'nuevo@test.com',
            'nombre': 'Nuevo',
            'password': 'nuevo123',
            'rol_id': self.rol_cocinero.id
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Usuario.objects.filter(email='nuevo@test.com').exists())

    def test_crear_usuario_no_admin(self):
        for user in [self.recepcionista_user, self.cocinero_user, self.normal_user]:
            self.client.force_authenticate(user)
            url = reverse('usuario_crear')
            data = {
                'email': 'no_admin@test.com',
                'nombre': 'NoAdmin',
                'password': 'test123',
                'rol_id': self.rol_usuario.id
            }
            response = self.client.post(url, data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ----------------------------------------------------------
    # EDITAR
    # ----------------------------------------------------------

    def test_editar_usuario_admin(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('usuario_editar') + f'?id={self.user_test.id}'
        data = {'nombre': 'NombreEditado'}

        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user_test.refresh_from_db()
        self.assertEqual(self.user_test.nombre, 'NombreEditado')

    def test_editar_usuario_sin_id(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('usuario_editar')
        data = {'nombre': 'Nuevo'}

        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_usuario_no_existente(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('usuario_editar') + '?id=999'
        data = {'nombre': 'NoExiste'}

        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ----------------------------------------------------------
    # ELIMINAR
    # ----------------------------------------------------------

    def test_eliminar_usuario_admin(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('usuario_eliminar') + f'?id={self.user_test.id}'

        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Usuario.objects.filter(id=self.user_test.id).exists())

    def test_admin_no_puede_eliminarse_a_si_mismo(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('usuario_eliminar') + f'?id={self.admin_user.id}'

        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], "No puede eliminar su propio usuario.")

    def test_eliminar_usuario_no_existente(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('usuario_eliminar') + '?id=999'

        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['detail'], "Usuario no encontrado.")
