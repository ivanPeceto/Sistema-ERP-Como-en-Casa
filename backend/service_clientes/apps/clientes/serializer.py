from rest_framework import serializers
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    """!
    @brief Serializador para el modelo Cliente.
    @details
        Este serializador hereda de serializers.ModelSerializer de Django REST Framework.
        Convierte instancias del modelo Cliente a representaciones JSON y viceversa.
        Define qué campos del modelo Cliente se incluirán en su representación serializada
        y se utilizarán para la validación de datos de entrada.
    """

    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'telefono', 'direccion']