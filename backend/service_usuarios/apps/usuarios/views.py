from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializer import LogInSerializer, SignUpSerializer, UsuarioSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken


class UserLoginView(APIView):
    def post(self, request):
        loginserializer = LogInSerializer(data=request.data)

        if loginserializer.is_valid():
            user = loginserializer.validated_data['user']

            #Genera los tokens para el frontend
            #El token de refresh esta configurado para durar 1 dia
            #Y el de access 10 minutos
            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            refresh_token['email'] = user.email
            refresh_token['nombre'] = user.nombre
            refresh_token['is_superuser'] = user.is_superuser

            access_token['email'] = user.email
            access_token['nombre'] = user.nombre
            access_token['is_superuser'] = user.is_superuser

            return Response({
                    'refresh': str(refresh_token),
                    'access': str(access_token),
                    'user': UsuarioSerializer(user).data,
                })
        return Response(loginserializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserSignUpView(APIView):
    def post(self, request):
        signupserializer = SignUpSerializer(data=request.data)

        if signupserializer.is_valid():
            ##El metodo save llama automaticamente a create()
            user = signupserializer.save()

            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            refresh_token['email'] = user.email
            refresh_token['nombre'] = user.nombre
            refresh_token['is_superuser'] = user.is_superuser

            access_token['email'] = user.email
            access_token['nombre'] = user.nombre
            access_token['is_superuser'] = user.is_superuser
            
            return Response({
                'refresh': str(refresh_token),
                'access': str(access_token),
                'user': UsuarioSerializer(user).data,
            },status=status.HTTP_200_OK)
        return Response(signupserializer.errors, status=status.HTTP_400_BAD_REQUEST)
