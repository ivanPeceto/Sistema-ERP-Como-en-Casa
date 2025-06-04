from django.db import models

class PedidoProductos(models.Model):
    id_pedido = models.ForeignKey("pedidos.Pedido", db_column=("id_pedido"), on_delete=models.CASCADE)
    id_producto = models.IntegerField(db_column='id_producto')
    cantidad_producto = models.DecimalField(db_column= 'cantidad_producto', max_digits=6, decimal_places=2)
    nombre_producto = models.CharField(max_length=100, db_column='nombre_producto')
    precio_unitario = models.DecimalField(db_column= 'precio_unitario', max_digits=10, decimal_places=2)
    