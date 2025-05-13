from rest_framework import serializers
from .models import Usuario, UserManager
from django.contrib.auth import authenticate
#----- Los serializers transforman las clases de django en json y validan datos-------##


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre', 'fecha_creacion']

class SignInSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['email', 'nombre', 'password']

        def create(self, validated_data):
            return UserManager.objects.create_user(**validated_data)
        
class LogInSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        ##busca en el modelo una coincidencia con el usuario solicitado ##
        ##chequea automaticamente con el hash utilizado en el proyecto
        user = authenticate(username=data['email'],
                            password=data['password'])
        if not user:
            raise serializers.ValidationError('Credenciales invalidas...')
        
        return {'user' : user}