from django.contrib import admin
from django.urls import path, include
from apps.healthcheck.views import HealthCheckView

urlpatterns = [
    path('healthcheck/', HealthCheckView.as_view(), name='healthcheck'),

    #Rutas de Pedidos
    path('api/pedidos/', include('apps.pedidos.urls')),

    #Rutas de Cobros
    path('api/pedidos/cobros', include('apps.cobros.urls')),

    #Rutas de Métodos de Cobros
    path('api/pedidos/cobros/metodos', include('apps.metodos.urls')),
]




