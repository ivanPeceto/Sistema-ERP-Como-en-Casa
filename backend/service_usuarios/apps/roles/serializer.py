from rest_framework import serializers
from .models import Rol

class RolSerializer(serializers.ModelSerializer):
    """!
    @brief Serializador para el modelo Rol.
    @details
        Este serializador hereda de serializers.ModelSerializer de Django REST Framework.
        Convierte instancias del modelo Rol a representaciones JSON y viceversa.
        Define qué campos del modelo Rol se incluirán en su representación serializada
        y se utilizarán para la validación de datos de entrada.
    """

    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'descripcion']