from django.contrib import admin
from django.urls import path
from apps.pedidos.views import (
    PedidoListView,
    CrearPedidoView,
    EliminarPedidoView,
    EditarPedidoView,
    ImprimirPedidoView,
)
from apps.healthcheck.views import HealthCheckView

urlpatterns = [
    path('api/pedidos/healthcheck', HealthCheckView.as_view(), name='healthcheck'),
    path('api/pedidos/buscar/', PedidoListView.as_view(), name='pedidos'),
    path('api/pedidos/crear/', CrearPedidoView.as_view(), name='crear_pedido'),
    path('api/pedidos/eliminar/', EliminarPedidoView.as_view(), name='eliminar_pedido'),
    path('api/pedidos/editar/', EditarPedidoView.as_view(), name='editar_pedido'),
    path('api/pedidos/imprimir/', ImprimirPedidoView.as_view(), name='imprimir_pedido'),
]
