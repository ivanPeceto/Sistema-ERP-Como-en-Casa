from django.urls import path
from apps.usuarios.views import UserLoginView, UserSignUpView, UserTokenRefreshView, UsuarioListarView, UsuarioCrearView, UsuarioEliminarView, UsuarioEditarView

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='ingresar'),
    path('signup/', UserSignUpView.as_view(), name='registrarse'),
    path('refresh_token/', UserTokenRefreshView.as_view(), name='refresh_token'),
    path('listar/', UsuarioListarView.as_view(), name='usuario_listar'),
    path('crear/', UsuarioCrearView.as_view(), name='usuario_crear'),
    path('editar/', UsuarioEditarView.as_view(), name='usuario_editar'),
    path('eliminar/', UsuarioEliminarView.as_view(), name='usuario_eliminar')
]

