from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from apps.roles.models import Rol
from apps.usuarios.models import Usuario


class RolAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Crear roles base
        self.admin_rol, _ = Rol.objects.get_or_create(
            nombre="Administrador", defaults={"descripcion": "Acceso total"}
        )
        self.recep_rol, _ = Rol.objects.get_or_create(
            nombre="Recepcionista", defaults={"descripcion": "Atiende clientes"}
        )

        # Crear usuarios de prueba
        self.superuser = Usuario.objects.create_superuser(
            email="admin@test.com", password="admin123", nombre="superuser"
        )
        self.superuser.rol = self.admin_rol
        self.superuser.save()

        self.regular_user = Usuario.objects.create_user(
            email="user@test.com", password="user123", nombre="regularuser", rol=self.recep_rol
        )

        # Generar tokens para autenticación
        self.superuser_token = RefreshToken.for_user(self.superuser).access_token
        self.regular_user_token = RefreshToken.for_user(self.regular_user).access_token

        # Crear un rol base para usar en los tests de edición y búsqueda
        self.rol, _ = Rol.objects.get_or_create(
            nombre="Tester",
            defaults={"descripcion": "Rol de prueba temporal"}
        )

    # ===========================
    # TEST: CREAR ROL
    # ===========================
    def test_crear_rol_superuser(self):
        """Debe permitir crear un rol si el usuario es superusuario"""
        data = {
            "nombre": "Encargado",
            "descripcion": "Encargado del local"
        }
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.superuser_token}")
        count_before = Rol.objects.count()
        response = self.client.post("/api/usuarios/rol/crear/", data, format="json")
        count_after = Rol.objects.count()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(count_after, count_before + 1)
        self.assertTrue(Rol.objects.filter(nombre="Encargado").exists())

    def test_crear_rol_usuario_normal(self):
        """Debe denegar creación de rol a usuario no superuser"""
        data = {
            "nombre": "AdministradorTest",
            "descripcion": "Rol temporal"
        }
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.regular_user_token}")
        response = self.client.post("/api/usuarios/rol/crear/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ===========================
    # TEST: EDITAR ROL
    # ===========================
    def test_editar_rol_superuser(self):
        """Debe permitir editar un rol existente si es superusuario"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.superuser_token}")
        data = {"descripcion": "Recepcionista actualizado"}
        response = self.client.put(f"/api/usuarios/rol/editar/?id={self.rol.id}", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.rol.refresh_from_db()
        self.assertEqual(self.rol.descripcion, "Recepcionista actualizado")

    def test_editar_rol_sin_id(self):
        """Debe devolver error si no se pasa id en la query"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.superuser_token}")
        response = self.client.put("/api/usuarios/rol/editar/", {"descripcion": "X"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ===========================
    # TEST: ELIMINAR ROL
    # ===========================
    def test_eliminar_rol_superuser(self):
        """Debe permitir eliminar un rol si es superusuario"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.superuser_token}")

        # Crear un rol temporal para eliminar
        rol_temp = Rol.objects.create(nombre="Temporal", descripcion="Temporal")
        response = self.client.delete(f"/api/usuarios/rol/eliminar/?id={rol_temp.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Rol.objects.filter(id=rol_temp.id).exists())

    # ===========================
    # TEST: LISTAR ROLES
    # ===========================
    def test_listar_roles_superuser(self):
        """Debe listar roles si el usuario es superusuario"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.superuser_token}")
        response = self.client.get("/api/usuarios/rol/listar/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)

    # ===========================
    # TEST: BUSCAR ROL
    # ===========================
    def test_buscar_rol_por_nombre(self):
        """Debe permitir buscar un rol por nombre"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.superuser_token}")
        response = self.client.get(f"/api/usuarios/rol/buscar/?nombre={self.rol.nombre}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["nombre"], self.rol.nombre)

    def test_buscar_rol_sin_parametros(self):
        """Debe devolver error si no se pasa id ni nombre"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.superuser_token}")
        response = self.client.get("/api/usuarios/rol/buscar/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
