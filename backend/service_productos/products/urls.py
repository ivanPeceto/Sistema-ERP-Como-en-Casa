from django.urls import path
from apps.productos.views import (
    ProductoCrearView,
    ProductoEditarView,
    ProductoEliminarView,
    ProductoListarView,
    ProductoBuscarView
)
from apps.categorias.views import (
    CategoriaCrearView,
    CategoriaEditarView,
    CategoriaEliminarView,
    CategoriaListarView,
    CategoriaBuscarView
)


urlpatterns = [
    path('crear/', ProductoCrearView.as_view(), name='producto_crear'),
    path('editar/', ProductoEditarView.as_view(), name='producto_editar'),
    path('eliminar/', ProductoEliminarView.as_view(), name='producto_eliminar'),
    path('listar/', ProductoListarView.as_view(), name='producto_listar'),
    path('buscar/', ProductoBuscarView.as_view(), name='producto_buscar'),
    
    path('categoria/crear/', CategoriaCrearView.as_view(), name='categoria_crear'),
    path('categoria/editar/', CategoriaEditarView.as_view(), name='categoria_editar'),
    path('categoria/eliminar/', CategoriaEliminarView.as_view(), name='categoria_eliminar'),
    path('categoria/listar/', CategoriaListarView.as_view(), name='categoria_listar'),
    path('categoria/buscar/', CategoriaBuscarView.as_view(), name='categoria_buscar'),    
]
