from rest_framework import serializers
from apps.pedidos.models import Pedido
from apps.pedidosProductos.models import PedidoProductos
from utils.microservices_communications import get_precio_unitario

class PedidoSerializer(serializers.ModelSerializer):
    ##Llama automaticamente a get_productos() y get_total()cada vez que se instancie pedidoSerializer
    ##Hay que realizarlo ya que la columna productos por defecto no existe en
    ##la tabla de pedidos
    productos = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Pedido
        fields = ['id',
                  'numero_pedido',
                  'fecha_pedido',
                  'id_cliente',
                  'para_hora',
                  'productos',
                  'entregado',
                  'pagado',
                  'total']
    
    def create(self, validated_data):
        productos = validated_data.pop('productos')
        pedido = Pedido.objects.create(**validated_data)
        for producto in productos:
            PedidoProductos.objects.create(
                id_pedido = pedido['id'],
                id_producto = producto['id_producto'],
                nombre_producto= producto['nombre_producto'],
                cantidad_producto= producto['cantidad_producto'] 
            )
        return pedido

   # def delete(self, ):


    def get_productos(self, pedido):
        ##Busca en la tabla pedidoProductos todas las filas donde
        ##id_pedido sea el mismo que en el argumento pedido
        productos = PedidoProductos.objects.filter(id_pedido=pedido.id)
        json = PedidoProductosSerializer(productos, many=True).data
        return json

    def get_total(self, pedido):
        productos = PedidoProductos.objects.filter(id_pedido=pedido.id)
        total = 0.0

        for producto in productos:
            serializer = PedidoProductosSerializer(producto)
            subtotal = serializer.data.get('subtotal')

            if subtotal is not None:
                total += float(subtotal)
            
        return round(total,2)

class PedidoProductosSerializer(serializers.ModelSerializer):
    precio_unitario = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = PedidoProductos
        fields = ['id_pedido',
                  'id_producto',
                  'nombre_producto',
                  'cantidad_producto',
                  'precio_unitario',
                  'subtotal']
        
    def get_precio_unitario(self, producto):
        return get_precio_unitario(producto.id_producto)

    def get_subtotal(self, producto):
        precio = self.get_precio_unitario(producto)

        if precio is not None:
            return float(precio) * float(producto.cantidad_producto)
        else:
            return None
        
        
        