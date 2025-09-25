#/backend/service_pedidos/apps/cobros/serializer.py

""" 
#Admite un único pago 
from decimal import Decimal
from rest_framework import serializers
from apps.cobros.models import Cobro
from apps.pedidos.serializer import PedidoSerializer

class CobroSerializer(serializers.ModelSerializer):
    metodo_cobro_nombre = serializers.CharField(source='id_metodo_cobro.nombre', read_only=True)
    subtotal = serializers.SerializerMethodField()  # Viene del Pedido

    class Meta:
        model = Cobro
        fields = [
            'id',
            'pedido',
            'subtotal',
            'moneda',
            'id_metodo_cobro',
            'metodo_cobro_nombre',
            'descuento',
            'recargo',
            'monto', 
        ]
        read_only_fields = ['monto', 'subtotal', 'metodo_cobro_nombre']

    def get_subtotal(self, obj):
        pedido = obj.pedido
        pedido_serializer = PedidoSerializer(pedido)
        return Decimal(pedido_serializer.data.get('total', 0))

    def create(self, validated_data):
        pedido = validated_data['pedido']
        pedido_serializer = PedidoSerializer(pedido)
        subtotal = Decimal(pedido_serializer.data.get('total', 0))

        descuento = Decimal(validated_data.get('descuento', 0))
        recargo = Decimal(validated_data.get('recargo', 0))

        monto = subtotal + recargo - descuento

        cobro = Cobro.objects.create(
            **validated_data,
            monto=round(monto, 2)
        )
        return cobro
 """


#Admite múltiples pagos
# /backend/service_pedidos/apps/cobros/serializers.py

from rest_framework import serializers
from decimal import Decimal
from .models import Cobro
from apps.pedidos.serializer import PedidoSerializer
from django.db.models import Sum

class CobroSerializer(serializers.ModelSerializer):
    # Ahora se permite monto como campo de entrada opcional
    monto = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = Cobro
        fields = '__all__'

    def create(self, validated_data):
        pedido = validated_data['pedido']
        pedido_serializer = PedidoSerializer(pedido)
        subtotal = Decimal(pedido_serializer.data.get('total', 0))

        descuento = Decimal(validated_data.get('descuento', 0))
        recargo = Decimal(validated_data.get('recargo', 0))

        total_abonado = Cobro.objects.filter(pedido=pedido).aggregate(Sum('monto'))['monto__sum'] or Decimal("0.00")
        monto_restante = subtotal - total_abonado

        if monto_restante <= 0:
            raise serializers.ValidationError({
                'monto': 'El pedido ya fue pagado completamente.'
            })

        # Si el cliente especifica monto manual, se usa ese
        monto_manual = validated_data.pop('monto', None)

        if monto_manual is not None:
            monto_a_pagar = Decimal(monto_manual)
        else:
            monto_a_pagar = monto_restante + recargo - descuento

        if monto_a_pagar <= 0:
            raise serializers.ValidationError({
                'monto': 'El monto calculado debe ser mayor a cero.'
            })

        if monto_a_pagar > monto_restante:
            raise serializers.ValidationError({
                'monto': f'El pago excede el total del pedido. Ya abonado: {total_abonado}, nuevo cobro: {monto_a_pagar}, subtotal: {subtotal}'
            })

        cobro = Cobro.objects.create(
            **validated_data,
            monto=round(monto_a_pagar, 2)
        )

        if total_abonado + monto_a_pagar >= subtotal:
            pedido.pagado = True
            pedido.save()

        return cobro

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        pedido = instance.pedido

        pedido_serializer = PedidoSerializer(pedido)
        subtotal = Decimal(pedido_serializer.data.get('total', 0))
        total_abonado = Cobro.objects.filter(pedido=pedido).aggregate(Sum('monto'))['monto__sum'] or Decimal("0.00")

        rep['monto_restante'] = float(max(subtotal - total_abonado, 0))
        rep['pagado_completo'] = total_abonado >= subtotal

        return rep

    #valida si el nuevo monto editado hace que el total de cobros supere el subtotal del pedido
    def update(self, instance, validated_data):
        pedido = validated_data.get('pedido', instance.pedido)
        pedido_serializer = PedidoSerializer(pedido)
        subtotal = Decimal(pedido_serializer.data.get('total', 0))

        descuento = Decimal(validated_data.get('descuento', instance.descuento))
        recargo = Decimal(validated_data.get('recargo', instance.recargo))
        monto_manual = validated_data.get('monto', instance.monto)

        # Total abonado en otros cobros
        total_abonado_otros = Cobro.objects.filter(pedido=pedido).exclude(id=instance.id).aggregate(Sum('monto'))['monto__sum'] or Decimal("0.00")
        monto_restante = subtotal - total_abonado_otros

        # Nuevo monto propuesto
        monto_nuevo = Decimal(monto_manual)

        if monto_nuevo <= 0:
            raise serializers.ValidationError({
                'monto': 'El monto debe ser mayor a cero.'
            })

        if monto_nuevo > monto_restante:
            raise serializers.ValidationError({
                'monto': f'El nuevo monto excede el total del pedido. Ya abonado (otros cobros): {total_abonado_otros}, nuevo monto: {monto_nuevo}, subtotal: {subtotal}'
            })

        # Guardar valores actualizados
        instance.pedido = pedido
        instance.id_metodo_cobro = validated_data.get('id_metodo_cobro', instance.id_metodo_cobro)
        instance.monto = round(monto_nuevo, 2)
        instance.moneda = validated_data.get('moneda', instance.moneda)
        instance.descuento = descuento
        instance.recargo = recargo
        instance.save()

        # Actualizar estado del pedido
        total_final = total_abonado_otros + monto_nuevo
        pedido.pagado = total_final >= subtotal
        pedido.save()

        return instance