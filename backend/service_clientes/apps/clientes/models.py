from django.db import models

class Cliente(models.Model):
    """!
    @brief Modelo para representar a un cliente en el sistema.
    @details
        Este modelo hereda de models.Model de Django, lo que le proporciona
        funcionalidades ORM para interactuar con la base de datos.
        Cada instancia de esta clase representa una fila en la tabla 'cliente'.
    """

    id = models.AutoField(primary_key=True, db_column='id_cliente')
    nombre = models.CharField(max_length=100, db_column='nombre_cliente')
    telefono = models.CharField(max_length=20, db_column='telefono_cliente')
    direccion = models.TextField(db_column='direccion_cliente')

    class Meta:
        db_table = 'cliente'