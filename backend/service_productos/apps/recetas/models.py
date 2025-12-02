from decimal import Decimal
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
    
    insumos = models.ManyToManyField("insumos.Insumo", through='RecetaInsumo', related_name='recetas')

    sub_recetas = models.ManyToManyField(
        "self",
        through='RecetaSubReceta',
        symmetrical=False,
        related_name='es_ingrediente_de'
    )

    class Meta:
        db_table = 'receta'

    def calcular_costo(self):
        costo_total = Decimal('0.00')

        # Sumar costo de insumos directos
        for detalle in self.recetainsumo_set.all():
            costo_total += detalle.insumo.costo_unitario * detalle.cantidad

        # Sumar costo de sub-recetas (Recursividad)
        for detalle_sub in self.recetasubreceta_principal.all():
            sub_receta = detalle_sub.receta_hija
            costo_total += sub_receta.calcular_costo() * detalle_sub.cantidad

        return costo_total


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

class RecetaSubReceta(models.Model):
    """ 
    @brief Cantidad de una 'Receta Hija' necesaria para la 'Receta Padre'.
    """
    receta_padre = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name='recetasubreceta_principal', db_column='id_receta_padre')
    receta_hija = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name='recetasubreceta_componente', db_column='id_receta_hija')
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, db_column='cantidad_sub_receta')

    class Meta:
        db_table = 'receta_sub_receta'
        unique_together = ('receta_padre', 'receta_hija')