from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings

class MicroservicesJWTAuthentication(JWTAuthentication):
    """!
    @brief Clase de autenticación JWT personalizada para microservicios.
    @details
        Esta clase hereda de JWTAuthentication de rest_framework_simplejwt.
        Modifica el comportamiento de cómo se obtiene el objeto usuario
        una vez que un token JWT ha sido validado.
        Django REST Framework necesita un objeto 'usuario' que satisfaga
        los requisitos para el manejo de permisos y autenticación, basado en la información contenida dentro del token JWT.
        Esta clase crea un objeto ficticio utilizando los claims del token validado.
    """
    def get_user(self, validated_token):
        """!
        @brief Obtiene un objeto usuario ficticio a partir de un token JWT validado.
        @details
            Sobrescribe el método get_user de la clase base.
            En lugar de intentar cargar un usuario completo desde la base de datos, construye
            una instancia de una clase interna FalseUser.
            Esta instancia de FalseUser contiene el user_id y el estado is_superuser
            extraídos directamente del payload del token JWT.

        @param validated_token: El token JWT ya validado. Contiene los claims del usuario.
        @return FalseUser: Una instancia de la clase interna FalseUser.
        """

        class FalseUser:
            """!
            @brief Clase interna para representar un usuario ficticio.
            @details
                Esta clase se utiliza para crear objetos que simulan ser un usuario de Django
                autenticado. No se almacena en la base de datos de este microservicio, sino que
                se construye dinámicamente a partir de la información del token JWT.
                Proporciona los atributos esenciales (`id`, `is_authenticated`, `is_superuser`)
                que Django REST Framework y el sistema de permisos pueden necesitar para
                operar correctamente dentro de un microservicio que consume el JWT.
            """

            def __init__(self, user_id, is_superuser=False):
                self.id = user_id
                self.is_authenticated = True
                self.is_superuser = is_superuser

        user_id = validated_token[api_settings.USER_ID_CLAIM]
        is_superuser = validated_token.get('is_superuser', False)
        
        return FalseUser(user_id, is_superuser)