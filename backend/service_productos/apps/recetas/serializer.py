from rest_framework import serializers
from .models import Receta, RecetaInsumo, RecetaSubReceta
from apps.insumos.serializer import InsumoSerializer

class RecetaInsumoSerializer(serializers.ModelSerializer):
    """!
    @brief Serializer para la relación Receta-Insumo, usado para LECTURA.
    @details
        Muestra los detalles completos del insumo y la cantidad requerida.
    """
    insumo_nombre = serializers.ReadOnlyField(source='insumo.nombre')
    insumo_unidad = serializers.ReadOnlyField(source='insumo.unidad_medida')
    insumo_id = serializers.IntegerField()

    class Meta:
        model = RecetaInsumo
        fields = ['insumo_id', 'insumo_nombre', 'insumo_unidad', 'cantidad']

class RecetaSubRecetaSerializer(serializers.ModelSerializer):
    receta_hija_nombre = serializers.ReadOnlyField(source='receta_hija.nombre')
    receta_hija_id = serializers.IntegerField()

    class Meta:
        model = RecetaSubReceta
        fields = ['receta_hija_id', 'receta_hija_nombre', 'cantidad']

class RecetaSerializer(serializers.ModelSerializer):
    insumos = RecetaInsumoSerializer(source='recetainsumo_set', many=True)
    sub_recetas = RecetaSubRecetaSerializer(source='recetasubreceta_principal', many=True, required=False)
    costo_estimado = serializers.SerializerMethodField()

    class Meta:
        model = Receta
        fields = ['id', 'nombre', 'descripcion', 'insumos', 'sub_recetas', 'costo_estimado']

    def get_costo_estimado(self, obj):
        return obj.calcular_costo()

    def create(self, validated_data):
        insumos_data = validated_data.pop('recetainsumo_set', [])
        sub_recetas_data = validated_data.pop('recetasubreceta_principal', [])
        
        receta = Receta.objects.create(**validated_data)
        
        # Crear relaciones Insumos
        for item in insumos_data:
            RecetaInsumo.objects.create(receta=receta, **item)
            
        # Crear relaciones Sub-Recetas
        for item in sub_recetas_data:
            RecetaSubReceta.objects.create(receta_padre=receta, **item)
            
        return receta

    def update(self, instance, validated_data):
        # Lógica de actualización (borrar previos y recrear para simplicidad)
        insumos_data = validated_data.pop('recetainsumo_set', [])
        sub_recetas_data = validated_data.pop('recetasubreceta_principal', [])

        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.save()

        # Actualizar Insumos
        instance.recetainsumo_set.all().delete()
        for item in insumos_data:
            RecetaInsumo.objects.create(receta=instance, **item)

        # Actualizar Sub-Recetas
        instance.recetasubreceta_principal.all().delete()
        for item in sub_recetas_data:
            RecetaSubReceta.objects.create(receta_padre=instance, **item)

        return instance