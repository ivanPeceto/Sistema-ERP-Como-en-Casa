"""
URL configuration for products project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from apps.productos.views import (
    ProductoCrearView,
    ProductoEditarView,
    ProductoEliminarView,
    ProductoListarView,
)

urlpatterns = [
    path('productos/crear/', ProductoCrearView.as_view(), name='producto_crear'),
    path('productos/editar/<int:pk>/', ProductoEditarView.as_view(), name='producto_editar'),
    path('productos/eliminar/<int:pk>/', ProductoEliminarView.as_view(), name='producto_eliminar'),
    path('productos/listar/', ProductoListarView.as_view(), name='producto_listar'),
]
