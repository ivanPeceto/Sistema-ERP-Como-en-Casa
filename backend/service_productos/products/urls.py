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
    path('api/productos/crear/', ProductoCrearView.as_view(), name='producto_crear'),
    path('api/productos/editar/', ProductoEditarView.as_view(), name='producto_editar'),
    path('api/productos/eliminar/', ProductoEliminarView.as_view(), name='producto_eliminar'),
    path('api/productos/listar/', ProductoListarView.as_view(), name='producto_listar'),
    path('api/productos/buscar/', ProductoBuscarView.as_view(), name='producto_buscar'),
    
    path('api/productos/categoria/crear/', CategoriaCrearView.as_view(), name='categoria_crear'),
    path('api/productos/categoria/editar/', CategoriaEditarView.as_view(), name='categoria_editar'),
    path('api/productos/categoria/eliminar/', CategoriaEliminarView.as_view(), name='categoria_eliminar'),
    path('api/productos/categoria/listar/', CategoriaListarView.as_view(), name='categoria_listar'),
    path('api/productos/categoria/buscar/', CategoriaBuscarView.as_view(), name='categoria_buscar'),    
]
