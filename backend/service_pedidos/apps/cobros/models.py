from django.db import models
from apps.pedidos.models import Pedido

class Cobro(models.Model):
    """!
    @brief Modelo que representa un cobro realizado sobre un pedido.
    @details
        Este modelo almacena información sobre los cobros realizados, incluyendo
        el tipo de pago, monto, fecha, detalles de transacción y estado.
        
        - Los cobros pueden ser de tipo: efectivo, débito, crédito o Mercado Pago.
        - El estado puede ser `activo` o `cancelado`.
        - Incluye campos opcionales como banco, referencia, cuotas, descuento y recargo,
          dependiendo del tipo de cobro.
        - Está vinculado a un `Pedido`, y cada pedido puede tener múltiples cobros.
    
    @attributes
        id : AutoField
            Identificador único del cobro. Se almacena en la columna `id_cobro`.
        pedido : ForeignKey
            Relación con el modelo `Pedido`. Se elimina en cascada si el pedido se elimina.
        tipo : CharField
            Tipo de cobro. Valores posibles: 'efectivo', 'debito', 'credito', 'mercadopago'.
        monto : DecimalField
            Monto del cobro. Máximo 10 dígitos, 2 decimales.
        moneda : CharField
            Moneda del cobro. Default 'ARS'.
        fecha : DateField
            Fecha en la que se realiza el cobro.
        banco : CharField, opcional
            Banco involucrado en el cobro (para cobros electrónicos).
        referencia : CharField, opcional
            Referencia de la transacción bancaria o de pago.
        cuotas : IntegerField, opcional
            Número de cuotas en caso de cobros a crédito.
        descuento : DecimalField, opcional
            Descuento aplicado al cobro.
        recargo : DecimalField, opcional
            Recargo aplicado al cobro.
        estado : CharField
            Estado del cobro. Valores posibles: 'activo', 'cancelado'.
    
    @methods
        __str__()
            Retorna una representación legible del cobro: tipo, monto, pedido y estado.
    
    @meta
        db_table : 'cobros'
        verbose_name : "Cobro"
        verbose_name_plural : "Cobros"
    """

    TIPO_CHOICES = [
        ("efectivo", "Efectivo"),
        ("debito", "Débito"),
        ("credito", "Crédito"),
        ("mercadopago", "Mercado Pago"),
    ]

    ESTADOS = [
        ('activo', 'Activo'),
        ('cancelado', 'Cancelado'),
    ]

    id = models.AutoField(primary_key=True, db_column='id_cobro')

    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        db_column='id_pedido',
        related_name='cobros'
    )

    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, db_column='tipo_cobro')
    monto = models.DecimalField(max_digits=10, decimal_places=2, db_column='monto_cobro')
    moneda = models.CharField(max_length=20, db_column='moneda_cobro', default='ARS', blank=True, null=True)
    fecha = models.DateField(db_column='fecha_cobro')

    # Opcionales según tipo de cobro
    banco = models.CharField(max_length=50, blank=True, null=True, db_column='banco_cobro')
    referencia = models.CharField(max_length=100, blank=True, null=True, db_column='referencia_cobro')
    cuotas = models.IntegerField(blank=True, null=True, db_column='cuotas_cobro')

    # Opcionales según descuento/aumento
    descuento= models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_column="descuento_cobro")
    recargo= models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_column="recargo_cobro")
    estado = models.CharField(max_length=20, choices=ESTADOS, default='activo')

    def __str__(self):
        return f"{self.tipo.capitalize()} - {self.monto} {self.moneda} (Pedido #{self.pedido_id}) - {self.estado}"

    class Meta:
        db_table = 'cobros'
        verbose_name = "Cobro"
        verbose_name_plural = "Cobros"
