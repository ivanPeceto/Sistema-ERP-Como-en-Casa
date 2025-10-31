from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.roles.models import Rol

Usuario = get_user_model()


class Command(BaseCommand):
    help = "Crea un usuario administrador inicial y los roles base si no existen."

    def handle(self, *args, **options):
        # =============================
        # CREACIÓN DE ROLES BASE
        # =============================
        roles = [
            ("Administrador", "Acceso total al sistema"),
            ("Recepcionista", "Gestiona la atención al cliente"),
            ("Cocinero", "Prepara las comidas")
        ]

        for nombre, descripcion in roles:
            obj, created = Rol.objects.get_or_create(nombre=nombre, defaults={"descripcion": descripcion})
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Rol '{nombre}' creado"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️ Rol '{nombre}' ya existía"))

        # =============================
        # CREACIÓN DE USUARIO ADMIN
        # =============================
        admin_email = "admin@admin.com"
        admin_nombre = "admin"
        admin_password = "admin"

        rol_admin = Rol.objects.get(nombre="Administrador")

        admin_user, created = Usuario.objects.get_or_create(
            email=admin_email,
            defaults={
                "nombre": admin_nombre,
                "is_superuser": True,
                "rol": rol_admin
            },
        )

        if created:
            admin_user.set_password(admin_password)
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f"✅ Usuario administrador creado: {admin_email}"))
        else:
            self.stdout.write(self.style.WARNING(f"⚠️ Usuario '{admin_email}' ya existía."))

        self.stdout.write(self.style.SUCCESS("🎉 Seed completado exitosamente."))
