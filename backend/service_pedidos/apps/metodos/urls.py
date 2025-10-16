from django.contrib import admin
from django.urls import path
from apps.metodos.views import ( 
    MetodoCobroCrearView,
    MetodoCobroEditarView,
    MetodoCobroEliminarView, 
    MetodoCobroListarView,
    MetodoCobroBuscarView
)

urlpatterns = [
    path('listar/', MetodoCobroListarView.as_view(), name='metodos_cobros'),
    path('buscar/', MetodoCobroBuscarView.as_view(), name='buscar_metodos_cobros'),
    path('crear/', MetodoCobroCrearView.as_view(), name='crear_metodos_cobros'),
    path('editar/', MetodoCobroEditarView.as_view(), name='editar_metodos_cobros'),
    path('eliminar/', MetodoCobroEliminarView.as_view(), name='eliminar_metodos_cobros'),
]
