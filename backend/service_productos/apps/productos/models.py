from django.db import models

# Create your models here.

class Producto(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_producto')
    nombre = models.CharField(max_length=100, db_column='nombre_producto')
    descripcion = models.TextField(db_column='descripcion_producto')
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, db_column='precio_unitario_producto')
    precio_por_bulto = models.DecimalField(max_digits=10, decimal_places=2, db_column='precio_por_bulto_producto')
    disponible = models.BooleanField(default=True, db_column='disponible_producto')

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = 'producto'
