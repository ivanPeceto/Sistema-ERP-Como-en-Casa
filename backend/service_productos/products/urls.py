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
    path('editar/<int:pk>/', ProductoEditarView.as_view(), name='producto_editar'),
    path('eliminar/<int:pk>/', ProductoEliminarView.as_view(), name='producto_eliminar'),
    path('listar/', ProductoListarView.as_view(), name='producto_listar'),
    path('buscar/<int:pk>/', ProductoBuscarView.as_view(), name='producto_buscar'),  
]
