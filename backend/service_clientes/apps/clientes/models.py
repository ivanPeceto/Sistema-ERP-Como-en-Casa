from django.db import models

# Create your models here.
from django.db import models

class Cliente(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_cliente')
    nombre = models.CharField(max_length=100, db_column='nombre_cliente')
    telefono = models.CharField(max_length=20, db_column='telefono_cliente')
    direccion = models.TextField(db_column='direccion_cliente')

    class Meta:
        db_table = 'cliente'