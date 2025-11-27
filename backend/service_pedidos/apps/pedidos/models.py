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
        total = sum(Decimal(p.precio_unitario) * Decimal(p.cantidad_producto) for p in productos)
        return Decimal(total).quantize(Decimal('0.01'))

    def calcular_credito_real(self):
        """
        Calcula cuánto de la deuda se ha saldado realmente.
        Fórmula: Monto Pagado + Descuento - Recargo.
        
        Ejemplo Recargo: Pedido $100. Pago Tarjeta $110 (inc. $10 recargo).
                         Credito = 110 + 0 - 10 = $100. (Cubre la deuda exacta).
        Ejemplo Descuento: Pedido $100. Pago Efvo $90 (inc. $10 descuento).
                           Credito = 90 + 10 - 0 = $100. (Cubre la deuda exacta).
        """
        credito_total = Decimal('0.00')
        
        cobros_activos = self.cobros.filter(estado='activo')
        
        for cobro in cobros_activos:
            monto = cobro.monto or Decimal('0.00')
            descuento = cobro.descuento or Decimal('0.00')
            recargo = cobro.recargo or Decimal('0.00')
            
            credito_real = monto + descuento - recargo
            credito_total += credito_real
            
        return credito_total

    def saldo_pendiente(self):
        """
        Retorna la deuda restante.
        Si es negativo, significa que el cliente pagó de más (crédito a favor).
        """
        total_pedido = self.calcular_total()
        credito_real = self.calcular_credito_real()
        
        saldo = total_pedido - credito_real

        # Tolerancia para errores de redondeo de centavos
        if abs(saldo) < Decimal("0.01"):
            return Decimal("0.00")

        return saldo.quantize(Decimal("0.01"))

    def save(self, *args, **kwargs):
        self.cliente = self.cliente.upper()

        self.total = self.calcular_total()

        if self.pk:
            saldo = self.saldo_pendiente()
            self.pagado = saldo <= 0

        super().save(*args, **kwargs)

    class Meta:
        db_table = 'pedidos'
