from django.db import models
from django.utils import timezone

class Pedido(models.Model):
    """!
    @brief Modelo para representar un pedido.
    @details
        Este modelo hereda de models.Model de Django, lo que le permite interactuar
        con la base de datos a través del ORM de Django. Cada instancia de esta clase
        representa un pedido individual con sus detalles asociados.
    """

    # Enum de estados de un pedido
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
    fecha_pedido = models.DateTimeField(default=timezone.now, db_column='fecha_pedido')    #Deprecated
    id_cliente = models.IntegerField(db_column='id_cliente')
    #--
    cliente = models.CharField(max_length=100, default="Sin nombre", db_column='cliente')
    para_hora = models.TimeField(db_column='para_hora', null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default=ESTADO_PENDIENTE, db_column='estado')
    #Deprecated
    entregado = models.BooleanField(db_column='entregado')
    #--
    avisado = models.BooleanField(db_column='avisado')
    pagado = models.BooleanField(db_column='pagado')

    def save(self, *args, **kwargs):
        self.cliente = self.cliente.upper()
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'pedidos'


