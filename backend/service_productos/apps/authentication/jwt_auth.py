from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings


class MicroservicesJWTAuthentication(JWTAuthentication):
    """!
    @brief Autenticación JWT personalizada para entornos de microservicios.
    @details
        Esta clase extiende `JWTAuthentication` de la librería 
        **rest_framework_simplejwt** para permitir la autenticación entre
        microservicios sin necesidad de acceder a la base de datos local.

        En lugar de buscar el usuario en el modelo `User`, esta autenticación
        reconstruye un **usuario ficticio en memoria** a partir de los claims
        incluidos en el token JWT.

        Esto es útil cuando distintos microservicios necesitan validar tokens
        emitidos por un servicio de autenticación centralizado, pero no
        comparten la misma base de datos.

        El usuario generado dinámicamente implementa los atributos mínimos
        requeridos por Django REST Framework para que las vistas y permisos
        puedan funcionar correctamente (`is_authenticated`, `id`, `email`, `rol`, etc.).
    """

    def get_user(self, validated_token):
        """!
        @brief Crea un usuario en memoria a partir de los claims del token JWT.
        @details
            Este método se invoca automáticamente una vez que el token ha sido
            validado.  
            En lugar de realizar una consulta a la base de datos, se construye
            un objeto de usuario temporal (instancia de la clase interna `FalseUser`).

            El método espera que el token contenga los siguientes claims:
            - **user_id:** Identificador único del usuario.
            - **email:** Correo electrónico del usuario.
            - **nombre:** Nombre completo del usuario.
            - **is_superuser:** Indica si el usuario tiene privilegios de administrador.
            - **rol:** Nombre del rol asignado al usuario (por ejemplo, "Administrador").

            El objeto resultante puede ser utilizado por Django REST Framework
            como `request.user`, lo que permite aplicar permisos, filtros y
            autenticación sin dependencia de la base de datos.

        @param validated_token: Diccionario con los claims del JWT ya validados.
        @return:
            Un objeto `FalseUser` que representa al usuario autenticado.
        """

        class FalseUser:
            """!
            @brief Representa un usuario ficticio creado desde los claims del token.
            @details
                Este objeto actúa como un sustituto del modelo `User` tradicional,
                permitiendo que las vistas, serializers y permisos funcionen
                correctamente sin acceso a la base de datos.

                Incluye los atributos:
                - **id:** ID del usuario (del claim `user_id`).
                - **email:** Correo electrónico.
                - **nombre:** Nombre completo.
                - **is_superuser:** Indica si es superusuario.
                - **rol:** Rol asignado (por ejemplo, "Administrador").
                - **is_authenticated:** Siempre `True` (requerido por DRF).
            """

            def __init__(self, user_id, email=None, nombre=None, is_superuser=False, rol=None):
                self.id = user_id
                self.email = email
                self.nombre = nombre
                self.is_superuser = is_superuser
                self.rol = rol
                self.is_authenticated = True  

            def __str__(self):
                """!
                @brief Retorna una representación legible del usuario.
                @return str: Cadena con el formato "nombre (email)".
                """
                return f"{self.nombre} ({self.email})"

        user_id = validated_token.get(api_settings.USER_ID_CLAIM)  
        email = validated_token.get("email")
        nombre = validated_token.get("nombre")
        is_superuser = validated_token.get("is_superuser", False)
        rol = validated_token.get("rol")

        return FalseUser(
            user_id=user_id,
            email=email,
            nombre=nombre,
            is_superuser=is_superuser,
            rol=rol,
        )
