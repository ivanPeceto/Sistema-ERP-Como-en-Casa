from rest_framework import serializers
from .models import Receta, RecetaInsumo
from apps.insumos.models import Insumo
from apps.insumos.serializer import InsumoSerializer

class RecetaInsumoSerializer(serializers.ModelSerializer):
    """!
    @brief Serializer para la relación Receta-Insumo, usado para LECTURA.
    @details
        Muestra los detalles completos del insumo y la cantidad requerida.
    """
    insumo = InsumoSerializer(read_only=True)

    class Meta:
        model = RecetaInsumo
        fields = ['insumo', 'cantidad']

class RecetaInsumoWriteSerializer(serializers.Serializer):
    """!
    @brief Serializer auxiliar para la ESCRITURA de insumos en una receta.
    @details
        Espera el ID de un insumo y la cantidad.
    """
    insumo_id = serializers.IntegerField()
    cantidad = serializers.DecimalField(max_digits=10, decimal_places=2)


class RecetaSerializer(serializers.ModelSerializer):
    """!
    @brief Serializador principal para el modelo Receta.
    @details
        Maneja la lógica de lectura y escritura para la receta y sus insumos.
    """
    # Para LECTURA: Muestra la lista de insumos con sus detalles y cantidades
    insumos = RecetaInsumoSerializer(source='recetainsumo_set', many=True, read_only=True)
    
    # Para ESCRITURA: Espera una lista de objetos con 'insumo_id' y 'cantidad'
    insumos_data = serializers.ListField(child=RecetaInsumoWriteSerializer(), write_only=True)

    class Meta:
        model = Receta
        fields = ['id', 'nombre', 'descripcion', 'insumos', 'insumos_data']

    def create(self, validated_data):
        """!
        @brief Crea una nueva Receta y sus relaciones con Insumos.
        """
        insumos_data = validated_data.pop('insumos_data')
        receta = Receta.objects.create(**validated_data)
        
        for insumo_data in insumos_data:
            RecetaInsumo.objects.create(
                receta=receta,
                insumo_id=insumo_data['insumo_id'],
                cantidad=insumo_data['cantidad']
            )
        return receta

    def update(self, instance, validated_data):
        """!
        @brief Actualiza una Receta y sus relaciones con Insumos.
        @details
            Elimina las relaciones antiguas y crea las nuevas.
        """
        insumos_data = validated_data.pop('insumos_data')
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.save()

        instance.recetainsumo_set.all().delete()
        for insumo_data in insumos_data:
            RecetaInsumo.objects.create(
                receta=instance,
                insumo_id=insumo_data['insumo_id'],
                cantidad=insumo_data['cantidad']
            )
        return instance