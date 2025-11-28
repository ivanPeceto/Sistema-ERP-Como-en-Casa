# pedidos/serializers.py
from decimal import Decimal
from rest_framework import serializers
from apps.pedidos.models import Pedido
from apps.pedidosProductos.models import PedidoProductos
from apps.cobros.models import Cobro

class PedidoProductosSerializer(serializers.ModelSerializer):
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = PedidoProductos
        fields = [
            'id_producto',
            'nombre_producto',
            'cantidad_producto',
            'precio_unitario',
            'aclaraciones',
            'subtotal'
        ]

    def get_subtotal(self, producto):
        if producto.precio_unitario is not None:
            return float(Decimal(producto.precio_unitario) * Decimal(producto.cantidad_producto))
        return None


class PedidoSerializer(serializers.ModelSerializer):
    productos = PedidoProductosSerializer(many=True, write_only=True)
    productos_detalle = serializers.SerializerMethodField(read_only=True)
    total = serializers.SerializerMethodField()
    total_pagado = serializers.SerializerMethodField()
    saldo_pendiente = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = ['id',
                  'numero_pedido',
                  'fecha_pedido',
                  'cliente',
                  'para_hora',
                  'productos',
                  'productos_detalle',
                  'estado',
                  #
                  'entregado',
                  #
                  'avisado',
                  'pagado',
                  'total', 
                  #
                  'total_pagado',
                  'saldo_pendiente']
        extra_kwargs = {
            'productos': {'write_only': True}
        }

    def create(self, validated_data):
        productos_data = validated_data.pop('productos', [])
        pedido = Pedido.objects.create(**validated_data)
        for producto in productos_data:
            PedidoProductos.objects.create(
                id_pedido=pedido,
                id_producto=producto['id_producto'],
                nombre_producto=producto['nombre_producto'],
                cantidad_producto=producto['cantidad_producto'],
                precio_unitario=producto['precio_unitario'],
                aclaraciones=producto['aclaraciones']
            )
        pedido.save()
        return pedido

    def update(self, instance, validated_data):
        productos_data = validated_data.pop('productos', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Eliminar productos anteriores y crear los nuevos
        PedidoProductos.objects.filter(id_pedido=instance).delete()
        for producto in productos_data:
            PedidoProductos.objects.create(
                id_pedido=instance,
                id_producto=producto['id_producto'],
                nombre_producto=producto['nombre_producto'],
                cantidad_producto=producto['cantidad_producto'],
                precio_unitario=producto['precio_unitario'],
                aclaraciones=producto['aclaraciones']
            )
        instance.save()
        return instance

    def get_productos_detalle(self, pedido):
        productos = PedidoProductos.objects.filter(id_pedido=pedido.id)
        return PedidoProductosSerializer(productos, many=True).data

    def get_total(self, pedido):
        return float(pedido.total)

    def get_total_pagado(self, pedido):
        cobrado = sum(
            Decimal(c.monto) for c in pedido.cobros.filter(estado='activo')
        )
        return float(cobrado)

    def get_saldo_pendiente(self, pedido):
        return float(pedido.saldo_pendiente())

