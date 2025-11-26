from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings

class MicroservicesJWTAuthentication(JWTAuthentication):
    """!
    @brief Clase de autenticación JWT personalizada para microservicios.
    @details
        Esta clase hereda de JWTAuthentication de rest_framework_simplejwt.
        Permite reconstruir un usuario ficticio a partir de los claims del token JWT.
        Esto evita la necesidad de consultar la base de datos de usuarios en microservicios consumidores.
    """
    def get_user(self, validated_token):
        """!
        @brief Obtiene un objeto usuario ficticio a partir de un token JWT validado.
        @details
            Construye una instancia de FalseUser con los claims del token:
            - id
            - email
            - nombre
            - is_superuser
            - rol (único)
        """

        class FalseUser:
            """!
            @brief Usuario ficticio construido a partir de claims JWT.
            @details
                Proporciona atributos necesarios para DRF y permisos:
                - id
                - is_authenticated
                - is_superuser
                - email
                - nombre
                - rol (objeto con atributo nombre)
            """
            def __init__(self, user_id, email=None, nombre=None, is_superuser=False, rol_nombre=None):
                self.id = user_id
                self.email = email
                self.nombre = nombre
                self.is_authenticated = True
                self.is_superuser = is_superuser

                # Creamos un objeto rol con atributo nombre
                class RolFalso:
                    def __init__(self, nombre):
                        self.nombre = nombre

                self.rol = RolFalso(rol_nombre) if rol_nombre else None

        user_id = validated_token.get(api_settings.USER_ID_CLAIM)
        email = validated_token.get('email')
        nombre = validated_token.get('nombre')
        is_superuser = validated_token.get('is_superuser', False)

        # Tomamos solo el primer rol si viene como lista o string
        roles_claim = validated_token.get('roles')
        rol_nombre = None
        if isinstance(roles_claim, list) and roles_claim:
            rol_nombre = roles_claim[0]
        elif isinstance(roles_claim, str):
            rol_nombre = roles_claim

        return FalseUser(user_id, email, nombre, is_superuser, rol_nombre)

