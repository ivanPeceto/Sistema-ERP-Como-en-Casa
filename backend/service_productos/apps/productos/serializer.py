from rest_framework import serializers
from .models import Producto
from apps.categorias.models import Categoria
from apps.categorias.serializer import CategoriaSerializer
from apps.recetas.models import Receta

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

    receta_id = serializers.PrimaryKeyRelatedField(
        source='receta', 
        queryset=Receta.objects.all(), 
        write_only=True, 
        allow_null=True, 
        required=False
    )
    
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precio_unitario', 'disponible', 'stock', 'receta_id', 'receta', 'cantidad_receta', 'categoria_id', 'categoria']
