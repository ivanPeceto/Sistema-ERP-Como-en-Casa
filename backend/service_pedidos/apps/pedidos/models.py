# pedidos/models.py
from django.db import models
from django.utils import timezone
from decimal import Decimal
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
    cliente = models.CharField(max_length=100, default="Sin nombre", db_column='cliente')
    para_hora = models.TimeField(db_column='para_hora', null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default=ESTADO_PENDIENTE, db_column='estado')
    entregado = models.BooleanField(db_column='entregado', default=False)
    avisado = models.BooleanField(db_column='avisado', default=False)
    pagado = models.BooleanField(db_column='pagado', default=False)
    total = models.DecimalField(max_digits=10, decimal_places=2, db_column="total_pedido", default=0)
    
    def calcular_total(self):
        """Total original del pedido (sin descuentos ni recargos)."""
        productos = PedidoProductos.objects.filter(id_pedido=self.id)
        total = sum(p.precio_unitario * p.cantidad_producto for p in productos)
        return Decimal(total).quantize(Decimal('0.01'))

    def total_ajustado(self):
        """
        Total final que debe pagar el cliente,
        luego de aplicar descuentos y recargos.
        """
        total = self.calcular_total()

        descuento_total = Decimal('0.00')
        recargo_total = Decimal('0.00')

        for c in self.cobros.filter(estado='activo'):
            if c.descuento:
                descuento_total += total * (Decimal(c.descuento) / 100)
            if c.recargo:
                recargo_total += total * (Decimal(c.recargo) / 100)

        total_final = total - descuento_total + recargo_total
        return total_final.quantize(Decimal('0.01'))

    def saldo_pendiente(self):
        """
        Saldo pendiente exacto:
        total ajustado (con descuentos/recargos) - total cobrado.
        Con tolerancia de centavos para evitar falsos negativos.
        """
        total_ajustado = self.total_ajustado()

        total_cobrado = sum(
            Decimal(c.monto) for c in self.cobros.filter(estado='activo')
        )

        saldo = total_ajustado - total_cobrado

        # tolerancia para evitar casos como saldo = -0.009
        if abs(saldo) < Decimal("0.01"):
            return Decimal("0.00")

        return saldo.quantize(Decimal("0.01"))

    def save(self, *args, **kwargs):
        self.cliente = self.cliente.upper()

        self.total = self.calcular_total()

        if self.pk:
            self.pagado = self.saldo_pendiente() == 0

        super().save(*args, **kwargs)

    class Meta:
        db_table = 'pedidos'
