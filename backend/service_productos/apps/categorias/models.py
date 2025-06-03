from django.db import models

class Categoria(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_categoria')
    nombre = models.CharField(max_length=100, db_column='nombre_categoria')
    descripcion = models.TextField(db_column='descripcion_categoria')