from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializer import LogInSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .jwt_serializer import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserLoginView(APIView):
    def post(self, request):
        serializer = LogInSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']

            #Generar JWT aqui

            return Response({'token': ''})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    