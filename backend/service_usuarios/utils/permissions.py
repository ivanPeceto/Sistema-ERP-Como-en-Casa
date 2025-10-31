from rest_framework.permissions import BasePermission

class RolePermission(BasePermission):
    """
    Permite acceso solo a usuarios cuyo rol esté en la lista permitida.
    Ejemplo:
        permission_classes = [RolePermission(['Administrador', 'Gerente'])]
    """

    def __init__(self, allowed_roles=None):
        self.allowed_roles = allowed_roles or []

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.rol.nombre in self.allowed_roles


def AllowRoles(roles):
    """Retorna una subclase de RolePermission con roles predefinidos."""
    class CustomRolePermission(RolePermission):
        def __init__(self):
            super().__init__(allowed_roles=roles)
    return CustomRolePermission
