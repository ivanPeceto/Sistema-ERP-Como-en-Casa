#/backend/service_pedidos/apps/metodos/serializer.py
from rest_framework import serializers
from .models import MetodoCobro

class MetodoCobroSerializer(serializers.ModelSerializer):

    class Meta:
        model = MetodoCobro
        fields = ['id', 'nombre']