from django.urls import path
from apps.roles.views import (
    RolCrearView,
    RolEditarView,
    RolEliminarView,
    RolListarView,
    RolBuscarView
)

urlpatterns = [
    path('crear/', RolCrearView.as_view(), name='rol_crear'),
    path('editar/', RolEditarView.as_view(), name='rol_editar'),
    path('eliminar/', RolEliminarView.as_view(), name='rol_eliminar'),
    path('listar/', RolListarView.as_view(), name='rol_listar'),
    path('buscar/', RolBuscarView.as_view(), name='rol_buscar'),   
]
