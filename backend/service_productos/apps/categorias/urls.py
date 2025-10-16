from django.urls import path
from apps.categorias.views import (
    CategoriaCrearView,
    CategoriaEditarView,
    CategoriaEliminarView,
    CategoriaListarView,
    CategoriaBuscarView
)

urlpatterns = [
    path('crear/', CategoriaCrearView.as_view(), name='categoria_crear'),
    path('editar/', CategoriaEditarView.as_view(), name='categoria_editar'),
    path('eliminar/', CategoriaEliminarView.as_view(), name='categoria_eliminar'),
    path('listar/', CategoriaListarView.as_view(), name='categoria_listar'),
    path('buscar/', CategoriaBuscarView.as_view(), name='categoria_buscar'),   
]
