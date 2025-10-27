from django.urls import path, include

urlpatterns = [
    #Rutas de usuarios
    path('api/usuarios/', include('apps.usuarios.urls')),

    #Rutas de roles
    path('api/usuarios/rol/', include('apps.roles.urls')),

]
