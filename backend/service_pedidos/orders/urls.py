from django.contrib import admin
from django.urls import path
from apps.pedidos.views import (
    PedidoListView,
    CrearPedidoView,
    EliminarPedidoView,
    EditarPedidoView,
)

urlpatterns = [
    path('buscar/', PedidoListView.as_view(), name='pedidos'),
    path('crear/', CrearPedidoView.as_view(), name='crear_pedido'),
    path('eliminar/', EliminarPedidoView.as_view(), name='eliminar_pedido'),
    path('editar/', EditarPedidoView.as_view(), name='editar_pedido')
]
