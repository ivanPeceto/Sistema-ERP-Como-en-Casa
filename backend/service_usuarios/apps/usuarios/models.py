from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

#hereda de baseusermanager ya que esta clase por defecto encripta las contraseñas
class UserManager(BaseUserManager):
    def create_user(self, email, password, nombre):
        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        email = self.normalize_email(email)
        user = self.model(email=email, nombre=nombre)
        #guarda la contraseña ya hasheada con SHA256 y le aplica salt automaticamente
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password, nombre):
        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        email = self.normalize_email(email)
        user = self.model(email=email,
                           nombre=nombre,
                           is_staff=True,
                           is_superuser=True)
        user.set_password(password)
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, db_column='email_usuario')
    nombre = models.CharField(max_length=255, db_column='nombre_usuario')
    fecha_creacion = models.DateTimeField(default=timezone.now, db_column='fecha_creacion_usuario')
    is_active = models.BooleanField(default=True, db_column='activo_usuario')
    is_staff = models.BooleanField(default=False, db_column='admin_usuario')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre']

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'usuarios'
