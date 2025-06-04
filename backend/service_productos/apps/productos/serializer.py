from rest_framework import serializers
from .models import Producto
from apps.categorias.models import Categoria
from apps.categorias.serializer import CategoriaSerializer

class ProductoSerializer(serializers.ModelSerializer):
    categoria_id = serializers.PrimaryKeyRelatedField(source='categoria', queryset=Categoria.objects.all(), write_only=True)
    categoria = CategoriaSerializer(read_only=True) 

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precio_unitario', 'precio_por_bulto', 'disponible', 'categoria_id', 'categoria']
