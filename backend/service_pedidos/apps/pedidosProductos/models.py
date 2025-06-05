from django.db import models

class PedidoProductos(models.Model):
    """!
    @brief Modelo para representar los productos contenidos en un pedido.
    @details
        Este modelo hereda de models.Model de Django, lo que le permite interactuar
        con la base de datos a través del ORM de Django. 
        Este modelo actúa como una tabla media entre Pedido y los productos. 
        Almacena qué productos se incluyeron en un pedido específico,
        la cantidad de cada uno, y captura el nombre y precio unitario del producto
        en el momento en que se realizó el pedido. 
    """

    id_pedido = models.ForeignKey("pedidos.Pedido", db_column=("id_pedido"), on_delete=models.CASCADE)
    id_producto = models.IntegerField(db_column='id_producto')
    cantidad_producto = models.DecimalField(db_column= 'cantidad_producto', max_digits=6, decimal_places=2)
    nombre_producto = models.CharField(max_length=100, db_column='nombre_producto')
    precio_unitario = models.DecimalField(db_column= 'precio_unitario', max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'pedidoProductos'
