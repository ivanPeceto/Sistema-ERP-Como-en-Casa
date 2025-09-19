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

from apps.insumos.views import (
    InsumoCrearView,
    InsumoEditarView,
    InsumoEliminarView,
    InsumoListarView,
    InsumoBuscarView
)

from apps.recetas.views import (
    RecetaCrearView,
    RecetaEditarView,
    RecetaEliminarView,
    RecetaListarView,
    RecetaBuscarView
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

    path('api/productos/insumo/crear/', InsumoCrearView.as_view(), name='insumo_crear'),
    path('api/productos/insumo/editar/', InsumoEditarView.as_view(), name='insumo_editar'),
    path('api/productos/insumo/eliminar/', InsumoEliminarView.as_view(), name='insumo_eliminar'),
    path('api/productos/insumo/listar/', InsumoListarView.as_view(), name='insumo_listar'),
    path('api/productos/insumo/buscar/', InsumoBuscarView.as_view(), name='insumo_buscar'),

    path('api/productos/receta/crear/', RecetaCrearView.as_view(), name='receta_crear'),
    path('api/productos/receta/editar/', RecetaEditarView.as_view(), name='receta_editar'),
    path('api/productos/receta/eliminar/', RecetaEliminarView.as_view(), name='receta_eliminar'),
    path('api/productos/receta/listar/', RecetaListarView.as_view(), name='receta_listar'),
    path('api/productos/receta/buscar/', RecetaBuscarView.as_view(), name='receta_buscar'),

]
