from rest_framework import serializers
from .models import Categoria

class CategoriaSerializer(serializers.ModelSerializer):
    descripcion = serializers.CharField(required=False, allow_blank=True)
    """!
    @brief Serializador para el modelo Categoria.
    @details
        Este serializador hereda de serializers.ModelSerializer de Django REST Framework.
        Convierte instancias del modelo Categoria a representaciones JSON y viceversa.
        Define qué campos del modelo Categoria se incluirán en su representación serializada
        y se utilizarán para la validación de datos de entrada.
    """

    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion']
