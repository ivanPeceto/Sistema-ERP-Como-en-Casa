from django.db import models

class Categoria(models.Model):
    """!
    @brief Modelo para representar una categoría de productos.
    @details
        Este modelo hereda de models.Model de Django, proporcionando la base
        para la interacción con la base de datos a través del ORM de Django.
        Cada instancia de esta clase representa una categoría a la que pueden
        pertenecer los productos.
    """
    id = models.AutoField(primary_key=True, db_column='id_categoria')
    nombre = models.CharField(max_length=100, db_column='nombre_categoria')
    descripcion = models.TextField(db_column='descripcion_categoria')


    class Meta:
        db_table = 'categoria'
