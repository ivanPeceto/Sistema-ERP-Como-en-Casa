from django.contrib import admin
from django.urls import path
from apps.pedidos.views import (
    PedidoListView,
    CrearPedidoView,
    EliminarPedidoView,
    EditarPedidoView,
    ImprimirPedidoView,
    SaldoPendientePedidoView,
)

urlpatterns = [
    path('buscar/', PedidoListView.as_view(), name='pedidos'),
    path('crear/', CrearPedidoView.as_view(), name='crear_pedido'),
    path('eliminar/', EliminarPedidoView.as_view(), name='eliminar_pedido'),
    path('editar/', EditarPedidoView.as_view(), name='editar_pedido'),
    path('imprimir/', ImprimirPedidoView.as_view(), name='imprimir_pedido'),
    path('saldo_pendiente/', SaldoPendientePedidoView.as_view(), name='saldo_pendiente_pedido'),
]

