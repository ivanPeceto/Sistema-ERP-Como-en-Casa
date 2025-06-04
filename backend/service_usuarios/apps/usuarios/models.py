from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    """!
    @brief Gestor personalizado para el modelo Usuario.
    @details
        Esta clase hereda de `BaseUserManager` de Django, lo que le permite
        manejar la creación de usuarios y superusuarios.
        `BaseUserManager` proporciona métodos útiles para formatear los correos electrónicos
        y gestiona internamente el proceso de hashing de contraseñas.
    """

    def create_user(self, email, password, nombre):
        """!
        @brief Crea y guarda un Usuario con el correo electrónico, contraseña y nombre dados.
        @details
            Primero, valida que el correo electrónico no esté vacío y luego lo normaliza.
            Crea una instancia del modelo `Usuario` con el email y nombre proporcionados.
            La contraseña se establece utilizando el método set_password que se encarga
            de hashear la contraseña antes de guardarla en la base de datos.
            Por defecto el algoritmo PBKDF2(Password-Based Key Derivation Function 2) con un hash SHA256.
            Este proceso incluye la generación de un salt aleatorio que se
            combina con la contraseña antes del hashing.
            Finalmente guarda el objeto usuario en la base de datos.
        @param email (str): El correo electrónico del usuario. Debe ser único.
        @param password (str): La contraseña en texto plano del usuario.
        @param nombre (str): El nombre del usuario.
        @return El objeto Usuario creado.
        @exception ValueError: Si el correo electrónico no es proporcionado.
        """

        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        email = self.normalize_email(email)
        user = self.model(email=email,
                            nombre=nombre)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password, nombre):
        """!
        @brief Crea y guarda un superusuario con el correo electrónico, contraseña y nombre dados.
        @details
            Está destinado a la creación de superusuarios. 
            Un superusuario tiene todos los permisos en el sistema.
            Al igual que en create_user, el correo se normaliza y la contraseña se hashea
            utilizando set_password, que implementa PBKDF2 con SHA256 y salting.
            El superusuario se guarda en la base de datos.
        @param email (str): El correo electrónico del superusuario. Debe ser único.
        @param password (str): La contraseña en texto plano del superusuario.
        @param nombre (str): El nombre del superusuario.
        @return El objeto `Usuario` (superuser) creado.
        @exception ValueError: Si el correo electrónico no es proporcionado.
        """

        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        email = self.normalize_email(email)
        user = self.model(email=email,
                           nombre=nombre,
                           is_superuser=True)
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
    fecha_creacion = models.DateTimeField(default=timezone.now, db_column='fecha_creacion_usuario')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre']

    class Meta:
        db_table = 'usuarios'
