from django.contrib import admin
from django.urls import path
from apps.pedidos.views import PedidoListView, CrearPedidoView

urlpatterns = [
    path('pedidos/', PedidoListView.as_view(), name='pedidos'),
    path('pedidos/crear', CrearPedidoView.as_view, name='crear_pedido'),
]
