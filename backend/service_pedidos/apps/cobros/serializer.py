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
    monto = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    descuento_porcentual = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, write_only=True)
    recargo_porcentual = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, write_only=True)

    class Meta:
        model = Cobro
        fields = '__all__'
        read_only_fields = ('descuento', 'recargo')

    def _get_pedido_total(self, pedido):
        """
        Helper para obtener el total de un pedido.
        """
        pedido_serializer = PedidoSerializer(pedido)
        return Decimal(pedido_serializer.data.get('total', 0))
    
    def create(self, validated_data):
        """
        Crea una instancia de Cobro, aplicando la lógica de negocio para
        descuentos, recargos y cálculo de montos.
        """
        pedido = validated_data['pedido']
        pedido_serializer = PedidoSerializer(pedido)
        subtotal = Decimal(pedido_serializer.data.get('total', 0))

        descuento_porcentual = validated_data.pop('descuento_porcentual', Decimal('0.0'))
        recargo_porcentual = validated_data.pop('recargo_porcentual', Decimal('0.0'))
        descuento_fijo = Decimal(validated_data.get('descuento', 0))
        recargo_fijo = Decimal(validated_data.get('recargo', 0))

        descuento_calculado = descuento_fijo + (subtotal * (descuento_porcentual / 100))
        recargo_calculado = recargo_fijo + (subtotal * (recargo_porcentual / 100))
    
        monto_final_del_pedido = subtotal - descuento_calculado + recargo_calculado
        monto_manual = validated_data.pop('monto', None)

        if monto_manual is not None:
            monto_a_pagar = Decimal(monto_manual)
        else:
            # Si no se especifica un monto, se asume que se paga el total restante
            total_abonado_previo = Cobro.objects.filter(pedido=pedido).aggregate(Sum('monto'))['monto__sum'] or Decimal("0.00")
            monto_restante = monto_final_del_pedido - total_abonado_previo
            monto_a_pagar = monto_restante

        if monto_a_pagar <= 0:
            raise serializers.ValidationError({
                'monto': 'El monto calculado debe ser mayor a cero.'
            })

        cobro = Cobro.objects.create(
            **validated_data,
            monto=round(monto_a_pagar, 2),
            descuento=round(descuento_calculado, 2),
            recargo=round(recargo_calculado, 2)
        )

        total_abonado_actual = (Cobro.objects.filter(pedido=pedido).aggregate(Sum('monto'))['monto__sum'] or Decimal("0.00"))
        pedido.pagado = total_abonado_actual >= subtotal
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