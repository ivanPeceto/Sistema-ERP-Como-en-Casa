from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from apps.roles.models import Rol
from apps.usuarios.models import Usuario 

class RolAPITestCase(APITestCase):

    def setUp(self):
        # Crear roles primero
        self.rol_admin = Rol.objects.create(nombre='Administrador')
        self.rol_recepcionista = Rol.objects.create(nombre='Recepcionista')
        self.rol_cocinero = Rol.objects.create(nombre='Cocinero')
        self.rol_usuario = Rol.objects.create(nombre='Usuario')

        # Crear usuarios asignando el objeto Rol
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

        # Rol de prueba para CRUD
        self.rol_test = Rol.objects.create(nombre='TestRol')

    def test_crear_rol_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('rol_crear')  # Ajusta según tu urls.py
        data = {'nombre': 'NuevoRol'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Rol.objects.filter(nombre='NuevoRol').exists())

    def test_crear_rol_no_admin(self):
        """Recepcionista, Cocinero y usuario normal no pueden crear rol"""
        for user in [self.recepcionista_user, self.cocinero_user, self.normal_user]:
            self.client.force_authenticate(user=user)
            url = reverse('rol_crear')
            data = {'nombre': 'NuevoRol'}
            response = self.client.post(url, data)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_editar_rol_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('rol_editar') + f'?id={self.rol_test.id}'
        data = {'nombre': 'RolEditado'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.rol_test.refresh_from_db()
        self.assertEqual(self.rol_test.nombre, 'RolEditado')

    def test_editar_rol_sin_id(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('rol_editar')
        data = {'nombre': 'RolEditado'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_eliminar_rol_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('rol_eliminar') + f'?id={self.rol_test.id}'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Rol.objects.filter(id=self.rol_test.id).exists())

    def test_listar_roles_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('rol_listar')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_buscar_rol_por_nombre(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('rol_buscar') + f'?nombre={self.rol_test.nombre}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['nombre'], self.rol_test.nombre)

    def test_buscar_rol_sin_parametros(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('rol_buscar')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
