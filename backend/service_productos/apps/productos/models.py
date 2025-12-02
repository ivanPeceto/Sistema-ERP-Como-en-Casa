from django.db import models

class Producto(models.Model):
    """!
    @brief Modelo para representar un producto.
    @details
        Este modelo hereda de models.Model de Django, proporcionando la base
        para la interacción con la base de datos a través del ORM de Django.
        Cada instancia de esta clase representa un producto.
    """
    
    id = models.AutoField(primary_key=True, db_column='id_producto')
    nombre = models.CharField(max_length=100, db_column='nombre_producto')
    descripcion = models.TextField(db_column='descripcion_producto')
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, db_column='precio_unitario_producto')
    disponible = models.BooleanField(default=True, db_column='disponible_producto')
    categoria = models.ForeignKey("categorias.Categoria", db_column=("id_categoria"), on_delete=models.CASCADE)

    stock = models.IntegerField(db_column='stock_producto', null=True, blank=True, default=0)

    receta = models.ForeignKey(
        "recetas.Receta",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="id_receta",
        related_name="productos_que_la_usan"
    )

    # Define cuánto de la receta consume 1 unidad de este producto.
    # Ej: 1 Empanada consume 1 unidad de la receta "Empanada". 
    # O 1 Docena consume 12 unidades de la receta.
    cantidad_receta = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=1, 
        db_column="cantidad_consumo_receta"
    )
    
    class Meta:
        db_table = 'producto'
