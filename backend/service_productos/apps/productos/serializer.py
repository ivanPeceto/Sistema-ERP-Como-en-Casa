from rest_framework import serializers
from .models import Producto
from apps.categorias.models import Categoria

class ProductoSerializer(serializers.ModelSerializer):
    categoria = serializers.SlugRelatedField(slug_field='nombre', queryset=Categoria.objects.all())
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precio_unitario', 'precio_por_bulto', 'disponible', 'categoria']


    #def create(self, validated_data):
            ##
