from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    """!
    @brief Permiso personalizado para restringir el acceso solo a superusuarios.
    @details
        Esta clase hereda de BasePermission de Django REST Framework.
        Se utiliza para definir una regla de permiso que verifica si el usuario
        asociado a la solicitud está autenticado y además tiene el atributo is_superuser=True.
    """

    def has_permission(self, request, view):
        """!
        @brief Verifica si el usuario solicitante tiene permiso para acceder a la vista.
        @details
            Este método es invocado por Django REST Framework para determinar si se debe
            conceder acceso a una vista particular.

        @param request: El objeto de la solicitud HTTP.
        @param view: La vista a la que se está intentando acceder. 
                    Este parámetro no se utiliza en esta implementación
        @return bool: True si el usuario está autenticado y es un superusuario, False en caso contrario
        """     
        return request.user and request.user.is_superuser
