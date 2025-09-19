from django.db import models

# Create your models here.
from django.db import models

class Receta(models.Model):
    """!
    @brief Modelo para representar una receta de un producto vendible.
    @details
        Una receta define los insumos y cantidades necesarias para preparar un producto.
        También puede estar asociada a uno o más productos finales.
    """
    id = models.AutoField(primary_key=True, db_column='id_receta')
    nombre = models.CharField(max_length=100, db_column='nombre_receta')
    descripcion = models.TextField(db_column='descripcion_receta', blank=True, null=True)
    
    productos = models.ManyToManyField("productos.Producto", related_name="recetas", db_table='receta_producto')

    insumos = models.ManyToManyField("insumos.Insumo", through='RecetaInsumo', related_name='recetas')

    class Meta:
        db_table = 'receta'


class RecetaInsumo(models.Model):
    """!
    @brief Modelo intermedio para la relación Many-to-Many entre Receta e Insumo.
    @details
        Almacena la cantidad de un insumo específico que se requiere para una receta dada.
    """
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, db_column='id_receta')
    insumo = models.ForeignKey("insumos.Insumo", on_delete=models.CASCADE, db_column='id_insumo')
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, db_column='cantidad_insumo')

    class Meta:
        db_table = 'receta_insumo'
        unique_together = ('receta', 'insumo') # Asegura que un insumo no se repita en la misma receta