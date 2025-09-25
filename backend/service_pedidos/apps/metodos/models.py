#/backend/service_pedidos/apps/metodos/models.py

from django.db import models

class MetodoCobro(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_metodo_cobro')
    nombre = models.CharField(max_length=100, db_column='nombre_metodo_cobro')

    class Meta:
        db_table = 'metodos_cobros'

