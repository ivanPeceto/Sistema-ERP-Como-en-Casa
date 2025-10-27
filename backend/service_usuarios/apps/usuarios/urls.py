from django.urls import path
from apps.usuarios.views import UserLoginView, UserSignUpView, UserTokenRefreshView

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='ingresar'),
    path('signup/', UserSignUpView.as_view(), name='registrarse'),
    path('refresh_token/', UserTokenRefreshView.as_view(), name='refresh_token')
]

