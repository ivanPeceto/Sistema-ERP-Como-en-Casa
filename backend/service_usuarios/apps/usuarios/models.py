from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from apps.roles.models import Rol

class UserManager(BaseUserManager):
    """!
    @brief Gestor personalizado para el modelo Usuario.
    @details
        Esta clase hereda de `BaseUserManager` de Django, lo que le permite
        manejar la creación de usuarios y superusuarios.
        `BaseUserManager` proporciona métodos útiles para formatear los correos electrónicos
        y gestiona internamente el proceso de hashing de contraseñas.
    """

    def create_user(self, email, password, nombre, rol=None):
        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        email = self.normalize_email(email)
        
        if rol is None:
            rol, _ = Rol.objects.get_or_create(nombre="Recepcionista")
        
        user = self.model(email=email, nombre=nombre, rol=rol)
        user.set_password(password)
        user.save(using=self._db)
        return user



class Usuario(AbstractBaseUser, PermissionsMixin):
    """!
    @brief Modelo personalizado para representar a un usuario en el sistema.
    @details
        Este modelo hereda de AbstractBaseUser y PermissionsMixin.
        AbstractBaseUser proporciona la implementación base de un modelo de usuario,
        incluyendo contraseñas hasheadas y manejo de tokens.
        PermissionsMixin añade los campos y métodos necesarios para soportar el framework
        de permisos de Django, incluyendo el campo is_superuser.
    @note USERNAME_FIELD se establece a 'email' para indicar que el correo electrónico
          será el campo utilizado para la autenticación.
    @note REQUIRED_FIELDS especifica los campos que se solicitarán al crear un usuario
          mediante el comando `createsuperuser` de Django, además del USERNAME_FIELD
          y la contraseña.
    """

    email = models.EmailField(unique=True, db_column='email_usuario')
    nombre = models.CharField(max_length=255, db_column='nombre_usuario')
    fecha_creacion = models.DateTimeField(
        default=timezone.now, 
        db_column='fecha_creacion_usuario')
    rol = models.ForeignKey(
        "roles.Rol",
        db_column="id_rol",
        on_delete=models.CASCADE
    )


    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre']

    class Meta:
        db_table = 'usuarios'
