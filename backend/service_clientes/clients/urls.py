from django.urls import path
from apps.clientes.views import (
    ClienteCrearView,
    ClienteEditarView,
    ClienteEliminarView,
    ClienteListarView,
    ClienteBuscarView,
)

urlpatterns = [
    path('api/clientes/crear/', ClienteCrearView.as_view(), name='cliente_crear'),
    path('api/clientes/editar/', ClienteEditarView.as_view(), name='cliente_editar'),
    path('api/clientes/eliminar/', ClienteEliminarView.as_view(), name='cliente_eliminar'),
    path('api/clientes/listar/', ClienteListarView.as_view(), name='cliente_listar'),
    path('api/clientes/buscar/', ClienteBuscarView.as_view(), name='cliente_buscar'), 
]
