from django.db import models

# Create your models here.
from django.db import models

class Insumo(models.Model):
    """!
    @brief Modelo para representar un insumo utilizado en las recetas.
    @details
        Este modelo hereda de models.Model de Django. Cada instancia representa
        un ingrediente o material base, como harina, queso, etc.
    """
    id = models.AutoField(primary_key=True, db_column='id_insumo')
    nombre = models.CharField(max_length=100, db_column='nombre_insumo')
    descripcion = models.TextField(db_column='descripcion_insumo', blank=True, null=True)
    unidad_medida = models.CharField(max_length=20, db_column='unidad_medida_insumo') # Ej: 'kg', 'litros', 'unidades'
    stock_actual = models.DecimalField(max_digits=10, decimal_places=2, db_column='stock_actual_insumo')
    costo_unitario = models.DecimalField(max_digits=10, decimal_places=2, db_column='costo_unitario_insumo')

    class Meta:
        db_table = 'insumo'