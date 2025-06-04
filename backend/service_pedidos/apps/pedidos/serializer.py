from rest_framework import serializers
from apps.pedidos.models import Pedido
from apps.pedidosProductos.models import PedidoProductos

class PedidoProductosSerializer(serializers.ModelSerializer):
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = PedidoProductos
        fields = [
                  'id_producto',
                  'nombre_producto',
                  'cantidad_producto',
                  'precio_unitario',
                  'subtotal']
        
    def get_subtotal(self, producto):
        precio = producto.precio_unitario

        if precio is not None:
            return float(precio) * float(producto.cantidad_producto)
        else:
            return None

class PedidoSerializer(serializers.ModelSerializer):
    ##Llama automaticamente a get_productos() y get_total()cada vez que se instancie pedidoSerializer
    ##Hay que realizarlo ya que la columna productos por defecto no existe en
    ##la tabla de pedidos
    productos = PedidoProductosSerializer(many=True, write_only=True)
    productos_detalle = serializers.SerializerMethodField(read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Pedido
        fields = ['id',
                  'numero_pedido',
                  'fecha_pedido',
                  'id_cliente',
                  'para_hora',
                  'productos',
                  'productos_detalle',
                  'entregado',
                  'pagado',
                  'total']
        extra_kwargs = {
            'productos': {'write_only': True}
        }
    
    def create(self, validated_data):
        #Añadir try except aca
        productos = validated_data.pop('productos', [])
        pedido = Pedido.objects.create(**validated_data)
        for producto in productos:
            PedidoProductos.objects.create(
                id_pedido = pedido,
                id_producto = producto['id_producto'],
                nombre_producto= producto['nombre_producto'],
                cantidad_producto= producto['cantidad_producto'],
                precio_unitario= producto['precio_unitario']
            )
        return pedido
    

    def update(self, instance, validated_data):
        productos = validated_data.pop('productos', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Eliminar los productos anteriores
        PedidoProductos.objects.filter(id_pedido=instance).delete()

        # Crear los nuevos productos
        for producto in productos:
            PedidoProductos.objects.create(
                id_pedido=instance,
                id_producto=producto['id_producto'],
                nombre_producto=producto['nombre_producto'],
                cantidad_producto=producto['cantidad_producto'],
                precio_unitario=producto['precio_unitario']
            )

        return instance

    #chequear la posibilidad de sacar esto
    #o explicarlo bien
    def get_productos_detalle(self, pedido):
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


        
        
        