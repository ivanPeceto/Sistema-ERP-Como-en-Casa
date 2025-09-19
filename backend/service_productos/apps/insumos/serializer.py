from rest_framework import serializers
from .models import Insumo

class InsumoSerializer(serializers.ModelSerializer):
    """!
    @brief Serializador para el modelo Insumo.
    @details
        Convierte instancias del modelo Insumo a representaciones JSON y viceversa,
        incluyendo todos los campos definidos en el modelo.
    """

    class Meta:
        model = Insumo
        fields = ['id', 'nombre', 'descripcion', 'unidad_medida', 'stock_actual', 'costo_unitario']