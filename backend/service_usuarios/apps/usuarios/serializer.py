from rest_framework import serializers
from .models import Usuario
from django.contrib.auth import authenticate
#----- Los serializers transforman las clases de django en json y validan datos-------##


class UsuarioSerializer(serializers.ModelSerializer):
    """!
    @brief Serializador para el modelo Usuario.
    @details
        Este serializador hereda de serializers.ModelSerializer de Django REST Framework.
        Su función principal es convertir instancias del modelo Usuario a representaciones JSON
        y viceversa.
        Define qué campos del modelo Usuario se incluirán en su representación serializada en JSON.
    """

    class Meta:
        model = Usuario
        rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)
        fields = ['id', 'email', 'nombre', 'fecha_creacion', 'rol_nombre']

class SignUpSerializer(serializers.ModelSerializer):
    """!
    @brief Serializador para el registro de nuevos usuarios.
    @details
        Este serializador está diseñado específicamente para manejar los datos necesarios
        para crear un nuevo Usuario. Hereda de serializers.ModelSerializer.
        Incluye un campo password que es de solo escritura,
        lo que significa que se puede usar para la deserialización (creación/actualización)
        pero no se incluirá en la representación serializada para proteger la contraseña.
    """

    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['email', 'nombre', 'password', 'rol']

    def create(self, validated_data):
        """!
        @brief Crea una nueva instancia de Usuario utilizando los datos validados.
        @details
            Este método se invoca cuando se llama a serializer.save() después de una
            validación exitosa.
            Utiliza el método create_user del gestor UserManager del modelo Usuario. 
        @param validated_data (dict): Diccionario que contiene los datos de entrada que
                                        han sido validados por el serializador.
                                        Se espera que contenga 'email', 'nombre' y 'password'.
        @return La instancia del objeto Usuario recién creado.
        """
        return Usuario.objects.create_user(**validated_data)
        
class LogInSerializer(serializers.Serializer):
    """!
    @brief Serializador para el inicio de sesión de usuarios.
    @details
        Este serializador hereda de la clase base serializers.Serializer de Django REST Framework,
        ya que no está directamente vinculado a la creación o actualización de un modelo específico,
        sino a la validación de credenciales.
        Define los campos esperados para un intento de inicio de sesión: 'email' y 'password'.
        Contiene lógica de validación para autenticar al usuario.
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """!
        @brief Valida las credenciales de inicio de sesión proporcionadas.
        @details
            Este método es llamado automáticamente por Django REST Framework cuando se llama a serializer.is_valid().
            Verificar si las credenciales email y password corresponden a un usuario activo en el sistema.
            La función authenticate compara la contraseña proporcionada con el hash almacenado
            en la base de datos, utilizando el mismo algoritmo de hashing y "salt" que se usó al crear la contraseña.
            Si la autenticación es exitosa, authenticate devuelve el objeto Usuario.
            Si no es exitosa, devuelve None.
        @param data (dict): Diccionario que contiene los datos de entrada de la solicitud.
                           Se espera que contenga 'email' y 'password'.
        @return Un diccionario que contiene el objeto Usuario autenticado.
        @exception serializers.ValidationError: Si la autenticación falla (credenciales inválidas).
                                              El mensaje 'Credenciales invalidas...' se enviará
                                              en la respuesta de error de la API.
        """
        user = authenticate(username=data['email'],
                            password=data['password'])
        if not user:
            raise serializers.ValidationError('Credenciales invalidas...')
        return {'user' : user}