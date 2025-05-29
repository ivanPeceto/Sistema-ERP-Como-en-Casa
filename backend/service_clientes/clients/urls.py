from django.urls import path
from apps.clientes.views import (
    ClienteCrearView,
    ClienteEditarView,
    ClienteEliminarView,
    ClienteListarView,
    ClienteBuscarView,
)

urlpatterns = [
    path('clientes/crear/', ClienteCrearView.as_view(), name='cliente_crear'),
    path('clientes/editar/<int:pk>/', ClienteEditarView.as_view(), name='cliente_editar'),
    path('clientes/eliminar/<int:pk>/', ClienteEliminarView.as_view(), name='cliente_eliminar'),
    path('clientes/listar/', ClienteListarView.as_view(), name='cliente_listar'),
    path('clientes/buscar/<int:pk>/', ClienteBuscarView.as_view(), name='cliente_buscar'), 
]