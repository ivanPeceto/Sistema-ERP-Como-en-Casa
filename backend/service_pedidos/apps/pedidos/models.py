# pedidos/models.py
from django.db import models
from django.utils import timezone
from apps.pedidosProductos.models import PedidoProductos

class Pedido(models.Model):
    ESTADO_PENDIENTE = 'PENDIENTE'
    ESTADO_LISTO = 'LISTO'
    ESTADO_ENTREGADO = 'ENTREGADO'
    
    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, 'PENDIENTE'),
        (ESTADO_LISTO, 'LISTO'),
        (ESTADO_ENTREGADO, 'ENTREGADO'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    numero_pedido = models.IntegerField(db_column='numero_pedido')    
    fecha_pedido = models.DateTimeField(default=timezone.now, db_column='fecha_pedido')
    id_cliente = models.IntegerField(db_column='id_cliente')
    cliente = models.CharField(max_length=100, default="Sin nombre", db_column='cliente')
    para_hora = models.TimeField(db_column='para_hora', null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default=ESTADO_PENDIENTE, db_column='estado')
    entregado = models.BooleanField(db_column='entregado')
    avisado = models.BooleanField(db_column='avisado')
    pagado = models.BooleanField(db_column='pagado')
    total = models.DecimalField(max_digits=10, decimal_places=2, db_column="total_pedido", default=0)

    def save(self, *args, **kwargs):
        self.cliente = self.cliente.upper()
        super().save(*args, **kwargs)

    def calcular_total(self):
        """
        Calcula el total del pedido sumando los subtotales de cada producto asociado.
        """
        productos = PedidoProductos.objects.filter(id_pedido=self.id)
        total = sum(p.precio_unitario * p.cantidad_producto for p in productos)
        return round(total, 2)

    def total_pagado(self):
        """
        Suma los montos de todos los cobros asociados a este pedido.
        """
        return sum(cobro.monto for cobro in self.cobros.all())

    def saldo_pendiente(self):
        """
        Devuelve cuánto falta pagar del pedido.
        """
        return float(self.calcular_total()) - float(self.total_pagado())

    class Meta:
        db_table = 'pedidos'
