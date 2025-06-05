from django.db import models

class Pedido(models.Model):
    """!
    @brief Modelo para representar un pedido.
    @details
        Este modelo hereda de models.Model de Django, lo que le permite interactuar
        con la base de datos a través del ORM de Django. Cada instancia de esta clase
        representa un pedido individual con sus detalles asociados.
    """

    id = models.AutoField(primary_key=True, db_column='id')
    numero_pedido = models.IntegerField(db_column='numero_pedido')    
    fecha_pedido = models.DateField(db_column='fecha_pedido')
    id_cliente = models.IntegerField(db_column='id_cliente')
    para_hora = models.TimeField(db_column='para_hora', null=True)
    entregado = models.BooleanField(db_column='entregado')
    pagado = models.BooleanField(db_column='pagado')

    class Meta:
        db_table = 'pedidos'
