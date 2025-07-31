
from django.contrib import admin
from django.urls import path
from apps.usuarios.views import UserLoginView, UserSignUpView, UserTokenRefreshView

urlpatterns = [
    path('api/usuarios/login/', UserLoginView.as_view(), name='ingresar'),
    path('api/usuarios/signup/', UserSignUpView.as_view(), name='registrarse'),
    path('api/usuarios/refresh_token/', UserTokenRefreshView.as_view(), name='refresh_token')
]

