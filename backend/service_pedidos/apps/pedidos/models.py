from django.db import models

class Pedido(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    numero_pedido = models.IntegerField(db_column='numero_pedido')    
    fecha_pedido = models.DateField(db_column='fecha_pedido')
    id_cliente = models.IntegerField(db_column='id_cliente')
    para_hora = models.TimeField(db_column='para_hora', null=True)
    entregado = models.BooleanField(db_column='entregado')
    pagado = models.BooleanField(db_column='pagado')


