#/backend/service_pedidos/apps/cobros/models.py

from django.db import models
from apps.pedidos.models import Pedido

class Cobro(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_cobro')
    """ 
    #Admite un solo pago
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE, db_column='id_pedido', related_name='cobro')
    # 
    """
    #Admite múltiples pagos
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        db_column='id_pedido',
        related_name='cobros'
    )
    #
    monto = models.DecimalField(max_digits=10, decimal_places=2, db_column='monto_cobro')
    moneda = models.CharField(max_length=20, db_column='moneda_cobro', null=True, blank=True, default= 'ARS')
    id_metodo_cobro = models.ForeignKey(
        'metodos.MetodoCobro',
        db_column='id_metodo_cobro',
        on_delete=models.CASCADE
    )
    descuento = models.DecimalField(max_digits=10, decimal_places=2, db_column='descuento', null=True, blank=True, default=0.00)
    recargo = models.DecimalField(max_digits=10, decimal_places=2, db_column='recargo', null=True, blank=True, default=0.00)

    class Meta:
        db_table = 'cobros'
