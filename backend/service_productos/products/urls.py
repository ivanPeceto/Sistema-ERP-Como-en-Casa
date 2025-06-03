from django.urls import path
from apps.productos.views import (
    ProductoCrearView,
    ProductoEditarView,
    ProductoEliminarView,
    ProductoListarView,
    ProductoBuscarView
)

urlpatterns = [
    path('crear/', ProductoCrearView.as_view(), name='producto_crear'),
    path('editar/', ProductoEditarView.as_view(), name='producto_editar'),
    path('eliminar/', ProductoEliminarView.as_view(), name='producto_eliminar'),
    path('listar/', ProductoListarView.as_view(), name='producto_listar'),
    path('buscar/', ProductoBuscarView.as_view(), name='producto_buscar'),  
]
