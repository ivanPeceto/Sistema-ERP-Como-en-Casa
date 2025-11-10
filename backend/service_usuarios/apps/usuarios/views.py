from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializer import LogInSerializer, SignUpSerializer, UsuarioSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


class UserLoginView(APIView):
    """!
    @brief Vista basada en clase para manejar el inicio de sesión de usuarios.
    @details
        Esta vista hereda de APIView de Django REST Framework, lo que permite
        definir métodos para el método HTTP POST.
        Utiliza LogInSerializer para validar las credenciales del usuario y, si son válidas,
        genera JWT de acceso y de refresco.
    """

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para el inicio de sesión de usuarios.
        @details
            Recibe los datos de la solicitud (email y contraseña) y los pasa al
            LogInSerializer para su validación.
            Si la validación es exitosa, se procede a generar los tokens JWT.

            Se utiliza RefreshToken.for_user(user) de la librería rest_framework_simplejwt
            para crear un token de refresco. A partir de este, se obtiene el token de acceso.
            - Access Token: Es el token de menor duración, configurado en 4 horas. 
            - Refresh Token: Es el token de larga duración, configurado en 1 día.

            Ambos tokens tienen añadida información adicional del usuario
            (email, nombre, is_superuser) directamente en su payload.

        @param request: El objeto de la solicitud HTTP que contiene los datos de login.
        @return:
                - Si el login es exitoso: Respuesta HTTP 200 OK con los tokens JWT
                  y los datos del usuario.
                - Si la validación falla: Respuesta HTTP 400 BAD REQUEST con los errores
                  reportados por el serializador.
        """
        
        loginserializer = LogInSerializer(data=request.data)

        if loginserializer.is_valid():
            user = loginserializer.validated_data['user']
            roles = []

            if hasattr(user, 'rol') and user.rol:
                roles = [user.rol.nombre]

            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            refresh_token['email'] = user.email
            refresh_token['nombre'] = user.nombre
            refresh_token['is_superuser'] = user.is_superuser
            refresh_token['roles'] = roles

            access_token['email'] = user.email
            access_token['nombre'] = user.nombre
            access_token['is_superuser'] = user.is_superuser
            access_token['roles'] = roles

            return Response({
                    'refresh': str(refresh_token),
                    'access': str(access_token),
                    'user': UsuarioSerializer(user).data,
                })
        return Response(loginserializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserSignUpView(APIView):
    """!
    @brief Vista basada en clase para manejar el registro de nuevos usuarios.
    @details
        Hereda de APIView. Utiliza SignUpSerializer para validar los datos de registro
        y crear un nuevo usuario. Si el registro es exitoso, también genera tokens JWT
        para el nuevo usuario, permitiendo un inicio de sesión automático tras el registro.
    """
    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para el registro de nuevos usuarios.
        @details
            Recibe los datos de la solicitud (email, nombre, contraseña) y los pasa al
            SignUpSerializer para su validación y creación del usuario.
            Si signupserializer.is_valid() es verdadero, se llama a signupserializer.save().
            Tras la creación exitosa del usuario, se generan tokens JWT
            Ambos tokens tienen añadida información adicional del usuariO
            (email, nombre, is_superuser) directamente en su payload.

        @param request (rest_framework.request.Request): El objeto de la solicitud HTTP,
                                                        que contiene los datos de registro.
        @return rest_framework.response.Response:
                - Si el registro es exitoso: Respuesta HTTP 200 OK con los tokens JWT
                  y los datos del nuevo usuario.
                - Si la validación falla: Respuesta HTTP 400 BAD REQUEST con los errores
                  reportados por el serializador.
        """
        signupserializer = SignUpSerializer(data=request.data)

        if signupserializer.is_valid():
            user = signupserializer.save()
            roles = []

            if hasattr(user, 'rol') and user.rol:
                roles = [user.rol.nombre]

            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            refresh_token['email'] = user.email
            refresh_token['nombre'] = user.nombre
            refresh_token['is_superuser'] = user.is_superuser
            refresh_token['roles'] = roles

            access_token['email'] = user.email
            access_token['nombre'] = user.nombre
            access_token['is_superuser'] = user.is_superuser
            access_token['roles'] = roles
            
            return Response({
                'refresh': str(refresh_token),
                'access': str(access_token),
                'user': UsuarioSerializer(user).data,
            },status=status.HTTP_200_OK)
        return Response(signupserializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserTokenRefreshView(APIView):
    """!
    @brief Vista para refrescar un token de acceso utilizando un refresh token.
    @details
        Esta vista permite renovar el token de acceso (Access Token) sin que el usuario
        tenga que autenticarse nuevamente con sus credenciales.
        El cliente envía un Refresh Token válido, y el sistema genera un nuevo Access Token
        con los mismos claims personalizados incluidos originalmente al iniciar sesión o registrarse.

        Los claims personalizados transferidos incluyen:
        - email: Correo electrónico del usuario.
        - nombre: Nombre completo del usuario.
        - is_superuser: Indica si el usuario tiene privilegios de administrador.
        - roles: Lista de roles asociados al usuario.

        El Refresh Token sigue siendo válido hasta su expiración (configurada en settings.py),
        por lo que puede seguir utilizándose para generar nuevos Access Tokens.

        En caso de que el Refresh Token haya expirado o sea inválido,
        se devuelve un error HTTP 400.
    """

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para la renovación del Access Token.
        @details
            Espera un cuerpo JSON con la forma:
                {"refresh": "token_refresh_valido"}

            Si el Refresh Token es válido:
                - Se genera un nuevo Access Token.
                - Se copian los claims personalizados (email, nombre, is_superuser, roles)
                  desde el Refresh Token original al nuevo Access Token.
                - Se devuelve el nuevo Access Token al cliente.

            Si el Refresh Token no está presente, es inválido o ha expirado,
            se devuelve un mensaje de error con código HTTP 400.

        @param request: Objeto de la solicitud HTTP con el campo "refresh" en el cuerpo JSON.
        @return:
                - Si el refresh token es válido: Respuesta HTTP 200 OK con un nuevo Access Token.
                - Si el refresh token no fue proporcionado o es inválido: Respuesta HTTP 400 BAD REQUEST.
        """
        refresh_token_str = request.data.get('refresh')

        if not refresh_token_str:
            return Response({'detail': 'El refresh token no fue proporcionado.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh_token = RefreshToken(refresh_token_str)
            access_token = refresh_token.access_token

            access_token['email'] = refresh_token.get('email')
            access_token['nombre'] = refresh_token.get('nombre')
            access_token['is_superuser'] = refresh_token.get('is_superuser', False)
            access_token['roles'] = refresh_token.get('roles', [])

            return Response({'access': str(access_token)}, status=status.HTTP_200_OK)

        except TokenError:
            return Response({'detail': 'El refresh token es inválido o ha expirado.'},
                            status=status.HTTP_400_BAD_REQUEST)
