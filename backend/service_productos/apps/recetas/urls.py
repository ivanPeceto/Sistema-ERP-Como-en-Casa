from django.urls import path
from apps.recetas.views import (
    RecetaCrearView,
    RecetaEditarView,
    RecetaEliminarView,
    RecetaListarView,
    RecetaBuscarView
)

urlpatterns = [
    path('crear/', RecetaCrearView.as_view(), name='receta_crear'),
    path('editar/', RecetaEditarView.as_view(), name='receta_editar'),
    path('eliminar/', RecetaEliminarView.as_view(), name='receta_eliminar'),
    path('listar/', RecetaListarView.as_view(), name='receta_listar'),
    path('buscar/', RecetaBuscarView.as_view(), name='receta_buscar'),
]
