from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings

class MicroservicesJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        #Es necesario crear un usuario ficticio que sirva para verificar
        #el JWT dentro de cada microservicio
        class FalseUser:
            def __init__(self, user_id, is_superuser=False):
                self.id = user_id
                self.is_authenticated = True
                self.is_superuser = is_superuser

        user_id = validated_token[api_settings.USER_ID_CLAIM]
        is_superuser = validated_token.get('is_superuser', False)
        return FalseUser(user_id, is_superuser)