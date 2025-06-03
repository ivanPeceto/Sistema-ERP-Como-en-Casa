from django.urls import path
from apps.clientes.views import (
    ClienteCrearView,
    ClienteEditarView,
    ClienteEliminarView,
    ClienteListarView,
    ClienteBuscarView,
)

urlpatterns = [
    path('crear/', ClienteCrearView.as_view(), name='cliente_crear'),
    path('editar/', ClienteEditarView.as_view(), name='cliente_editar'),
    path('eliminar/', ClienteEliminarView.as_view(), name='cliente_eliminar'),
    path('listar/', ClienteListarView.as_view(), name='cliente_listar'),
    path('buscar/', ClienteBuscarView.as_view(), name='cliente_buscar'), 
]