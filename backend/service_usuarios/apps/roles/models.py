from django.db import models

class Rol(models.Model):

    id = models.AutoField(primary_key=True, db_column='id_rol')
    nombre = models.CharField(
        max_length=50, 
        unique=True, 
        db_column='nombre_rol'
        )
    descripcion = models.TextField(blank=True, db_column='descripcion_rol')

    class Meta:
        db_table = 'roles'