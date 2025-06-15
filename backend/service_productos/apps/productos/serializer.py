from rest_framework import serializers
from .models import Producto
from apps.categorias.models import Categoria
from apps.categorias.serializer import CategoriaSerializer

class ProductoSerializer(serializers.ModelSerializer):
    """!
    @brief Serializador para el modelo Producto.
    @details
        Este serializador hereda de serializers.ModelSerializer y se encarga de
        convertir instancias del modelo Producto a representaciones JSON y viceversa.
        Maneja la relación con el modelo Categoria de una manera específica para
        la entrada y la salida de datos:
        - Para la entrada, se espera un ID de categoría a través del campo 'categoria_id'.
        - Para la salida, se proporciona una representación anidada
          completa del objeto `Categoria` asociado a través del campo 'categoria'.
    """
    categoria_id = serializers.PrimaryKeyRelatedField(source='categoria', queryset=Categoria.objects.all(), write_only=True)
    categoria = CategoriaSerializer(read_only=True) 

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precio_unitario', 'disponible', 'categoria_id', 'categoria']
