from rest_framework.permissions import BasePermission

class RolePermission(BasePermission):
    """!
    @brief Permiso personalizado basado en roles de usuario.
    @details
        Esta clase hereda de BasePermission de Django REST Framework y permite
        restringir el acceso a las vistas solo a usuarios cuyo rol esté dentro
        de una lista de roles permitidos.

        Se debe pasar una lista de nombres de roles válidos al inicializar la clase.
        Si el usuario no está autenticado o su rol no se encuentra en la lista,
        el acceso será denegado.

    @example
        permission_classes = [RolePermission(['Administrador', 'Gerente'])]
    """

    def __init__(self, allowed_roles=None):
        """!
        @brief Inicializa la clase RolePermission con los roles permitidos.
        @param allowed_roles: Lista de nombres de roles que tienen acceso permitido.
                              Si no se proporciona, se utiliza una lista vacía.
        """
        self.allowed_roles = allowed_roles or []

    def has_permission(self, request, view):
        """!
        @brief Verifica si el usuario tiene permiso para acceder a la vista.
        @details
            Este método es llamado automáticamente por Django REST Framework para determinar
            si un usuario autenticado tiene acceso a una vista o endpoint específico.

        @param request: Objeto de la solicitud HTTP que contiene la información del usuario.
        @param view: La vista que se intenta acceder (no utilizada directamente en esta implementación).
        @return bool: True si el usuario está autenticado y su rol pertenece a los roles permitidos,
                      False en caso contrario.
        """
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.rol.nombre in self.allowed_roles


def AllowRoles(*roles):
    """!
    @brief Crea una subclase personalizada de RolePermission con roles predefinidos.
    @details
        Función fábrica de permisos que genera dinámicamente una subclase de RolePermission
        con roles permitidos. Soporta tanto una lista/tupla como múltiples argumentos
        posicionales.
    
    @param roles: Lista, tupla o múltiples strings representando los roles autorizados.
    @return type: Subclase personalizada de RolePermission con los roles establecidos.
    
    @example
        permission_classes = [AllowRoles(['Administrador', 'Supervisor'])]
        permission_classes = [AllowRoles('Administrador', 'Supervisor')]
    """
    if len(roles) == 1 and isinstance(roles[0], (list, tuple)):
        roles = list(roles[0])
    else:
        roles = list(roles)

    class CustomRolePermission(RolePermission):
        def __init__(self):
            super().__init__(allowed_roles=roles)
    
    return CustomRolePermission

