from django.contrib import admin
from django.urls import path
from apps.pedidos.views import PedidoListView

urlpatterns = [
    path('pedidos/', PedidoListView.as_view(), name='pedidos'),
]
