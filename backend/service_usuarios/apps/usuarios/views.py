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
        Esta vista permite autenticar a un usuario mediante sus credenciales
        (correo electrónico y contraseña). Si las credenciales son válidas,
        se generan tokens JWT de acceso y de refresco, que contienen información
        adicional del usuario.

        Se utiliza `RefreshToken.for_user(user)` de la librería
        `rest_framework_simplejwt` para crear el token de refresco.
        A partir de este, se obtiene el token de acceso.

        Ambos tokens incluyen los siguientes claims personalizados:
        - **email:** correo electrónico del usuario.
        - **nombre:** nombre completo del usuario.
        - **is_superuser:** indica si el usuario es administrador.
        - **rol:** nombre del rol asociado al usuario (por ejemplo, "Administrador").

        El Access Token tiene una duración corta (por defecto, 4 horas),
        mientras que el Refresh Token tiene una duración más larga (por defecto, 1 día).
    """

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para el inicio de sesión de usuarios.
        @details
            Recibe los datos de autenticación (`email` y `password`) y los valida
            con el `LogInSerializer`.  
            Si la validación es exitosa, genera y devuelve los tokens JWT
            junto con los datos del usuario autenticado.

        @param request: Objeto HTTP con los datos de inicio de sesión.
        @return:
            - **200 OK:** Si el inicio de sesión es exitoso. Devuelve los tokens y el usuario.
            - **400 BAD REQUEST:** Si las credenciales son incorrectas o los datos son inválidos.
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
            refresh_token['rol'] = roles[0] if roles else None

            access_token['email'] = user.email
            access_token['nombre'] = user.nombre
            access_token['is_superuser'] = user.is_superuser
            access_token['rol'] = roles[0] if roles else None

            return Response({
                'refresh': str(refresh_token),
                'access': str(access_token),
                'user': UsuarioSerializer(user).data,
            })

        return Response(loginserializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserSignUpView(APIView):
    """!
    @brief Vista para el registro (sign up) de nuevos usuarios.
    @details
        Esta vista permite registrar un nuevo usuario en el sistema.
        Utiliza el `SignUpSerializer` para validar y crear el usuario.

        Una vez creado, se generan los tokens JWT (de acceso y de refresco),
        que incluyen información del usuario recién registrado.

        Los claims personalizados añadidos al token son:
        - **email**
        - **nombre**
        - **is_superuser**
        - **rol**
    """

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para el registro de nuevos usuarios.
        @details
            Valida y crea un nuevo usuario. Si el registro es exitoso,
            se devuelven los tokens JWT y los datos del usuario.

        @param request: Objeto HTTP con los datos de registro.
        @return:
            - **200 OK:** Registro exitoso, devuelve tokens y datos del usuario.
            - **400 BAD REQUEST:** Si hay errores de validación.
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
            refresh_token['rol'] = roles[0] if roles else None

            access_token['email'] = user.email
            access_token['nombre'] = user.nombre
            access_token['is_superuser'] = user.is_superuser
            access_token['rol'] = roles[0] if roles else None
            
            return Response({
                'refresh': str(refresh_token),
                'access': str(access_token),
                'user': UsuarioSerializer(user).data,
            }, status=status.HTTP_200_OK)

        return Response(signupserializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserTokenRefreshView(APIView):
    """!
    @brief Vista para renovar el Access Token usando un Refresh Token.
    @details
        Permite al cliente obtener un nuevo token de acceso sin necesidad
        de volver a autenticarse.  
        El cliente debe enviar un JSON con el campo `"refresh"` que contenga
        el Refresh Token válido.

        El nuevo Access Token conserva los mismos claims personalizados:
        - **email**
        - **nombre**
        - **is_superuser**
        - **rol**

        Si el Refresh Token ha expirado o es inválido, se devuelve un error 400.
    """

    def post(self, request):
        """!
        @brief Genera un nuevo Access Token a partir de un Refresh Token válido.
        @details
            Ejemplo de cuerpo de solicitud:
            ```json
            {
                "refresh": "token_refresh_valido"
            }
            ```

            Si el Refresh Token es válido:
            - Se genera un nuevo Access Token.
            - Se copian los claims personalizados (`email`, `nombre`, `is_superuser`, `rol`).
            - Se devuelve el nuevo token al cliente.

            Si el Refresh Token no es válido o ha expirado, se devuelve un error 400.

        @param request: Objeto de la solicitud HTTP con el campo "refresh".
        @return:
            - **200 OK:** Si el token fue renovado correctamente.
            - **400 BAD REQUEST:** Si el token es inválido o no se proporcionó.
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
            access_token['rol'] = refresh_token.get('rol')

            return Response({'access': str(access_token)}, status=status.HTTP_200_OK)

        except TokenError:
            return Response({'detail': 'El refresh token es inválido o ha expirado.'},
                            status=status.HTTP_400_BAD_REQUEST)
