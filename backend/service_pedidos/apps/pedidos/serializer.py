from rest_framework import serializers
from apps.pedidos.models import Pedido
from apps.pedidosProductos.models import PedidoProductos

class PedidoProductosSerializer(serializers.ModelSerializer):
    """!
    @brief Serializador para el modelo PedidoProductos (ítems de un pedido).
    @details
        Este serializador convierte instancias del modelo PedidoProductos a JSON.
        Calcula dinámicamente el subtotal para cada producto del pedido.
        Es utilizado tanto para la entrada de datos de productos al crear/actualizar
        un pedido como para mostrar los mismos.
    """
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
        """!
        @brief Calcula el subtotal para un ítem del pedido.
        @details
            Multiplica el precio_unitario del PedidoProductos por su cantidad_producto.
        @param producto_pedido: La instancia del modelo PedidoProductos
                                para la cual se calcula el subtotal.
        @return float | None: El subtotal calculado como un flotante, o None si el
                              precio unitario no está definido.
        """

        precio = producto.precio_unitario

        if precio is not None:
            return float(precio) * float(producto.cantidad_producto)
        else:
            return None

class PedidoSerializer(serializers.ModelSerializer):
    """!
    @brief Serializador para el modelo Pedido.
    @details
        Gestiona la serialización/deserialización de objetos Pedido.
        Maneja de forma anidada los productos asociados al pedido PedidoProductos:
        - Para la entrada, acepta una lista de productos a través del campo 'productos'.
        - Para la salida, muestra la lista de productos a través del campo 'productos_detalle' y calcula el 'total' del pedido.
    """

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
        """!
        @brief Crea una instancia de Pedido y sus PedidoProductos asociados.
        @details
            Sobrescribe el método create base para manejar la creación anidada.
        @param validated_data (dict): Datos validados por el serializador.
        @return Pedido: La instancia del 'Pedido' creado.
        """        
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
        """!
        @brief Actualiza una instancia de `Pedido` y sus `PedidoProductos` asociados.
        @details
            Sobrescribe el método `update` base.
            Extrae los datos de los productos. Actualiza los campos del `Pedido` (`instance`).
            Luego, elimina todos los `PedidoProductos` existentes asociados a esta instancia
            de pedido y crea nuevos `PedidoProductos` basados en los datos de `productos`
            proporcionados en la solicitud. Este enfoque (borrar y recrear) es una
            estrategia común para manejar actualizaciones de colecciones anidadas.
        @param instance (Pedido): La instancia original del `Pedido` a actualizar.
        @param validated_data (dict): Datos validados por el serializador para la actualización.
        @return Pedido: La instancia del `Pedido` actualizada.
        """
        
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


        
        
        