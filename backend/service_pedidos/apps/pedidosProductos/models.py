from django.db import models

class PedidoProductos(models.Model):
    id_pedido = models.IntegerField(models.ForeignKey("apps.pedidos", db_column=("id_pedido"), on_delete=models.CASCADE))
    id_producto = models.IntegerField(db_column='id_producto')