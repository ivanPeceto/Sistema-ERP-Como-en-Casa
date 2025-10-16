from django.urls import path
from apps.insumos.views import (
    InsumoCrearView,
    InsumoEditarView,
    InsumoEliminarView,
    InsumoListarView,
    InsumoBuscarView
)

urlpatterns = [
    path('crear/', InsumoCrearView.as_view(), name='insumo_crear'),
    path('editar/', InsumoEditarView.as_view(), name='insumo_editar'),
    path('eliminar/', InsumoEliminarView.as_view(), name='insumo_eliminar'),
    path('listar/', InsumoListarView.as_view(), name='insumo_listar'),
    path('buscar/', InsumoBuscarView.as_view(), name='insumo_buscar'),
]
