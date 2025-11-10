from types import SimpleNamespace
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.metodos.models import MetodoCobro

class MetodoCobroAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Métodos de cobro de prueba
        self.metodo1 = MetodoCobro.objects.create(nombre='Efectivo')
        self.metodo2 = MetodoCobro.objects.create(nombre='Tarjeta')

        # Usuario con rol Administrador
        self.admin_user = SimpleNamespace(
            is_authenticated=True,
            rol=SimpleNamespace(nombre='Administrador')
        )

        # Usuario sin rol administrador
        self.user = SimpleNamespace(
            is_authenticated=True,
            rol=SimpleNamespace(nombre='Usuario')
        )

    # ---------- TESTS CORRECTOS ----------
    def test_listar_metodos_cobro(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('metodos_cobros')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_buscar_metodo_por_id(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('buscar_metodos_cobros') + f'?id={self.metodo1.id}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['nombre'], 'Efectivo')

    def test_buscar_metodo_por_nombre(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('buscar_metodos_cobros') + '?nombre=Tarjeta'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['nombre'], 'Tarjeta')

    def test_crear_metodo_cobro_con_rol_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('crear_metodos_cobros')
        data = {'nombre': 'Transferencia'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MetodoCobro.objects.count(), 3)

    def test_editar_metodo_cobro(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('editar_metodos_cobros') + f'?id={self.metodo1.id}'
        data = {'nombre': 'Efectivo Modificado'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.metodo1.refresh_from_db()
        self.assertEqual(self.metodo1.nombre, 'Efectivo Modificado')

    def test_eliminar_metodo_cobro(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('eliminar_metodos_cobros') + f'?id={self.metodo2.id}'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(MetodoCobro.objects.filter(id=self.metodo2.id).exists())

    # ---------- TESTS DE PERMISOS ----------
    def test_crear_metodo_cobro_sin_rol_admin(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('crear_metodos_cobros')
        data = {'nombre': 'Transferencia'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_editar_metodo_cobro_sin_rol_admin(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('editar_metodos_cobros') + f'?id={self.metodo1.id}'
        data = {'nombre': 'Nombre'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_eliminar_metodo_cobro_sin_rol_admin(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('eliminar_metodos_cobros') + f'?id={self.metodo2.id}'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ---------- TESTS DE ERRORES ----------
    def test_editar_metodo_sin_id(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('editar_metodos_cobros')  # sin ?id=
        data = {'nombre': 'Nuevo nombre'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_metodo_no_existente(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('editar_metodos_cobros') + '?id=9999'
        data = {'nombre': 'Nuevo nombre'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_eliminar_metodo_sin_id(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('eliminar_metodos_cobros')  # sin ?id=
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_eliminar_metodo_no_existente(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('eliminar_metodos_cobros') + '?id=9999'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
