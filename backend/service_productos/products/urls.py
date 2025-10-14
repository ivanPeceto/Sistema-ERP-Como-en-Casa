from django.urls import path, include

urlpatterns = [
    #Rutas de productos
    path('api/productos/', include('apps.productos.urls')),

    #Rutas de categorias.
    path('api/productos/categoria/', include('apps.categorias.urls')),

    #Rutas de insumos.
    path('api/productos/insumo/', include('apps.insumos.urls')),

    #Rutas de recetas.
    path('api/productos/receta/', include('apps.recetas.urls')),
]
