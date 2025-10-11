#/backend/service_pedidos/orders/urls.py

from django.contrib import admin
from django.urls import path
from apps.pedidos.views import (
    PedidoListView,
    CrearPedidoView,
    EliminarPedidoView,
    EditarPedidoView,
    ImprimirPedidoView,
)
from apps.cobros.views import (
    CobroCrearView,
    CobroListView,
    CobroDetalleView,
    CobroEditarView,
    CobroEliminarView
)
from apps.metodos.views import ( 
    MetodoCobroCrearView,
    MetodoCobroEditarView,
    MetodoCobroEliminarView, 
    MetodoCobroListarView,
    MetodoCobroBuscarView
)
from apps.healthcheck.views import HealthCheckView

urlpatterns = [
    path('healthcheck/', HealthCheckView.as_view(), name='healthcheck'),

    #Rutas de Pedidos
    path('api/pedidos/buscar/', PedidoListView.as_view(), name='pedidos'),
    path('api/pedidos/crear/', CrearPedidoView.as_view(), name='crear_pedido'),
    path('api/pedidos/eliminar/', EliminarPedidoView.as_view(), name='eliminar_pedido'),
    path('api/pedidos/editar/', EditarPedidoView.as_view(), name='editar_pedido'),
    path('api/pedidos/imprimir/', ImprimirPedidoView.as_view(), name='imprimir_pedido'),
    #Rutas de Cobros
    path('api/cobros/listar/', CobroListView.as_view(), name='cobros'),
    path('api/cobros/crear/', CobroCrearView.as_view(), name='crear_cobro'),    
    path('api/cobros/detalle/', CobroDetalleView.as_view(), name='detalle_cobro'),
    path('api/cobros/editar/', CobroEditarView.as_view(), name='editar_cobro'),
    path('api/cobros/eliminar/', CobroEliminarView.as_view(), name='eliminar_cobro'),
    #Rutas de Métodos de Cobros
    path('api/cobros/metodos/listar/', MetodoCobroListarView.as_view(), name='metodos_cobros'),
    path('api/cobros/metodos/buscar/', MetodoCobroBuscarView.as_view(), name='buscar_metodos_cobros'),
    path('api/cobros/metodos/crear/', MetodoCobroCrearView.as_view(), name='crear_metodos_cobros'),
    path('api/cobros/metodos/editar/', MetodoCobroEditarView.as_view(), name='editar_metodos_cobros'),
    path('api/cobros/metodos/eliminar/', MetodoCobroEliminarView.as_view(), name='eliminar_metodos_cobros'),
]




