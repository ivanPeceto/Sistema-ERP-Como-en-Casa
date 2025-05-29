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
    path('editar/<int:pk>/', ClienteEditarView.as_view(), name='cliente_editar'),
    path('eliminar/<int:pk>/', ClienteEliminarView.as_view(), name='cliente_eliminar'),
    path('listar/', ClienteListarView.as_view(), name='cliente_listar'),
    path('buscar/<int:pk>/', ClienteBuscarView.as_view(), name='cliente_buscar'), 
]