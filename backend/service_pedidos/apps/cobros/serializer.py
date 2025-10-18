# /backend/service_pedidos/apps/cobros/serializers.py

from rest_framework import serializers
from decimal import Decimal
from .models import Cobro
from apps.pedidos.serializer import PedidoSerializer
from django.db.models import Sum

class CobroSerializer(serializers.ModelSerializer):
    monto = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    descuento_porcentual = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    recargo_porcentual = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)

    class Meta:
        model = Cobro
        fields = '__all__'

    def _get_pedido_total(self, pedido):
        """
        Helper para obtener el total de un pedido.
        """
        pedido_serializer = PedidoSerializer(pedido)
        return Decimal(pedido_serializer.data.get('total', 0))


    def _calculate_adjusted_values(self, validated_data, subtotal, instance=None):
        """
        Lógica centralizada para calcular descuentos, recargos y monto a pagar.
        """
        descuento_porcentual = validated_data.pop('descuento_porcentual', Decimal('0.0'))
        recargo_porcentual = validated_data.pop('recargo_porcentual', Decimal('0.0'))
        descuento_fijo = validated_data.pop('descuento', Decimal('0.0'))
        recargo_fijo = validated_data.pop('recargo', Decimal('0.0'))

        descuento_calculado = descuento_fijo + (subtotal * (descuento_porcentual / 100))
        recargo_calculado = recargo_fijo + (subtotal * (recargo_porcentual / 100))

        monto_final_del_pedido = subtotal - descuento_calculado + recargo_calculado
        monto_manual = validated_data.pop('monto', None)

        if monto_manual is not None:
            descuento_calculado = descuento_fijo + (monto_manual * (descuento_porcentual/100))
            recargo_calculado = recargo_fijo + (monto_manual * (recargo_porcentual/100))
            #monto_calculado = monto_manual - descuento_manual + recargo_manual
            monto_a_pagar = Decimal(monto_manual)
        else:
            qs = Cobro.objects.filter(pedido=validated_data.get('pedido', instance.pedido))
            if instance:
                qs = qs.exclude(id=instance.id)
            
            total_abonado_previo = qs.aggregate(Sum('monto'))['monto__sum'] or Decimal("0.00")
            monto_restante = monto_final_del_pedido - total_abonado_previo
            monto_a_pagar = monto_restante

        return monto_a_pagar, descuento_calculado, recargo_calculado, descuento_fijo, descuento_porcentual, recargo_fijo, recargo_porcentual

    def create(self, validated_data):
        pedido = validated_data['pedido']
        subtotal = self._get_pedido_total(pedido)

        monto_a_pagar, descuento_calculado, recargo_calculado, desc_fijo, desc_porcentual, rec_fijo, rec_porcentual = self._calculate_adjusted_values(validated_data, subtotal)
        monto_a_pagar = monto_a_pagar - descuento_calculado + recargo_calculado

        if monto_a_pagar <= 0 and not (desc_fijo > 0 or desc_porcentual > 0):
             raise serializers.ValidationError({'monto': 'El monto a pagar debe ser mayor a cero, a menos que solo se aplique un descuento.'})

        cobro = Cobro.objects.create(
            **validated_data,
            monto=round(monto_a_pagar, 2),
            descuento=round(desc_fijo, 2),
            recargo=round(rec_fijo, 2),
            descuento_porcentual=round(desc_porcentual, 2),
            recargo_porcentual=round(rec_porcentual, 2)
        )

        total_abonado_actual = Cobro.objects.filter(pedido=pedido).aggregate(Sum('monto'))['monto__sum'] or Decimal("0.00")
        pedido.pagado = total_abonado_actual >= subtotal
        pedido.save()

        return cobro

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        pedido = instance.pedido
        subtotal = self._get_pedido_total(pedido)

        total_abonado = Cobro.objects.filter(pedido=pedido).aggregate(Sum('monto'))['monto__sum'] or Decimal("0.00")
        
        monto_restante = subtotal - total_abonado

        rep['monto_restante'] = float(monto_restante)
        rep['pagado_completo'] = monto_restante <= 0
        return rep

    def update(self, instance, validated_data):
            pedido = validated_data.get('pedido', instance.pedido)
            subtotal = self._get_pedido_total(pedido)
            
            fields_to_check = [
                'monto', 'descuento', 'recargo',
                'descuento_porcentual', 'recargo_porcentual',
                'id_metodo_cobro'
            ]
            has_changed = False
            #Chequea si los datos son iguales
            for field in fields_to_check:
                new_value = validated_data.get(field, getattr(instance, field))
                if field == 'id_metodo_cobro':
                    if instance.id_metodo_cobro != new_value:
                        has_changed = True
                        break
                elif getattr(instance, field) != new_value:
                    has_changed = True
                    break
            #En ese caso no realiza ningún cálculo
            if not has_changed:
                return instance

            monto_a_pagar, descuento_calculado, recargo_calculado, desc_fijo, desc_porcentual, rec_fijo, rec_porcentual = self._calculate_adjusted_values(validated_data, subtotal)
            monto_a_pagar = monto_a_pagar - descuento_calculado + recargo_calculado
            
            if monto_a_pagar <= 0 and not (desc_fijo > 0 or desc_porcentual > 0):
                raise serializers.ValidationError({'monto': 'El monto a pagar debe ser mayor a cero, a menos que solo se aplique un descuento.'})

            for attr, value in validated_data.items():
                setattr(instance, attr, value)
                
            instance.monto = round(monto_a_pagar, 2)
            instance.descuento = round(desc_fijo, 2)
            instance.recargo = round(rec_fijo, 2)
            instance.descuento_porcentual = round(desc_porcentual, 2)
            instance.recargo_porcentual = round(rec_porcentual, 2)
            instance.save()

            total_abonado_actual = Cobro.objects.filter(pedido=pedido).aggregate(Sum('monto'))['monto__sum'] or Decimal("0.00")
            pedido.pagado = total_abonado_actual >= subtotal
            pedido.save()

            return instance