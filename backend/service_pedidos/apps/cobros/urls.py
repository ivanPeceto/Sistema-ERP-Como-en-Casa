from django.contrib import admin
from django.urls import path
from apps.cobros.views import (
    CobroCrearView,
    CobroListView,
    CobroDetalleView,
    CobroEditarView,
    CobroEliminarView
)

urlpatterns = [
    path('listar/', CobroListView.as_view(), name='cobros'),
    path('crear/', CobroCrearView.as_view(), name='crear_cobro'),    
    path('detalle/', CobroDetalleView.as_view(), name='detalle_cobro'),
    path('editar/', CobroEditarView.as_view(), name='editar_cobro'),
    path('eliminar/', CobroEliminarView.as_view(), name='eliminar_cobro'),
]
