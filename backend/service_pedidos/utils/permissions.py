from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    """!
    @brief Permiso personalizado basado en el rol del usuario.
    @details
        Esta clase extiende `BasePermission` de Django REST Framework
        para implementar un sistema de control de acceso basado en roles.

        Es completamente compatible con la autenticación
        **MicroservicesJWTAuthentication**, donde el atributo `user.rol`
        es un **string** que representa el nombre del rol (por ejemplo:
        `"Administrador"`, `"Recepcionista"`, `"Cajero"`).

        El permiso verifica que el usuario esté autenticado y que su rol
        se encuentre dentro de la lista de roles permitidos (`allowed_roles`).
        
        Si el usuario no está autenticado, no posee un rol o su rol no está
        en la lista autorizada, el acceso es denegado.

    @example
        permission_classes = [RolePermission(['Administrador', 'Recepcionista'])]
    """

    def __init__(self, allowed_roles=None):
        """!
        @brief Inicializa la clase RolePermission con los roles permitidos.
        @details
            Se define una lista de roles válidos que pueden acceder a la vista.
            Si no se proporciona una lista, se inicializa como vacía.
        
        @param allowed_roles: Lista de strings con los nombres de roles que tienen acceso permitido.
                              Ejemplo: `['Administrador', 'Recepcionista']`
        """
        self.allowed_roles = allowed_roles or []

    def has_permission(self, request, view):
        """!
        @brief Verifica si el usuario tiene permiso para acceder a la vista.
        @details
            - Comprueba si el usuario está autenticado (`is_authenticated`).
            - Obtiene el rol del usuario (`user.rol`).
            - Valida que dicho rol se encuentre dentro de la lista de roles permitidos.
            
            Si cualquiera de las condiciones falla, retorna `False`.

        @param request: Objeto `Request` que contiene al usuario autenticado.
        @param view: La vista o ViewSet que se intenta acceder.
        @return bool: `True` si el rol del usuario está permitido, `False` en caso contrario.
        """
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False

        # Como user.rol ahora es un string
        user_role = getattr(user, "rol", None)
        if not user_role:
            return False

        return user_role in self.allowed_roles


def AllowRoles(*roles):
    """!
    @brief Crea dinámicamente una subclase de RolePermission con roles predefinidos.
    @details
        Función fábrica que permite crear una clase de permiso personalizada
        con roles específicos sin necesidad de definir una nueva clase manualmente.

        Soporta tanto:
        - Una lista o tupla: `AllowRoles(['Administrador', 'Recepcionista'])`
        - Múltiples argumentos: `AllowRoles('Administrador', 'Recepcionista')`

        El resultado puede usarse directamente en las vistas de Django REST Framework.

    @param roles: Lista, tupla o múltiples argumentos de strings que representan los roles permitidos.
    @return type: Subclase personalizada de `RolePermission` con los roles establecidos.

    @example
        permission_classes = [AllowRoles('Administrador', 'Supervisor')]
        permission_classes = [AllowRoles(['Administrador', 'Recepcionista'])]
    """
    if len(roles) == 1 and isinstance(roles[0], (list, tuple)):
        roles = list(roles[0])
    else:
        roles = list(roles)

    class CustomRolePermission(RolePermission):
        """!
        @brief Subclase generada dinámicamente de `RolePermission`.
        @details
            Esta clase se crea internamente por la función `AllowRoles`
            y hereda automáticamente los roles definidos como permitidos.
        """
        def __init__(self):
            super().__init__(allowed_roles=roles)

    return CustomRolePermission


class AdminOnly(RolePermission):
    """!
    @brief Permiso restringido únicamente al rol **Administrador**.
    @details
        Esta clase es una especialización de `RolePermission` que permite
        el acceso solo a los usuarios cuyo `user.rol` sea `"Administrador"`.

    @example
        permission_classes = [AdminOnly]
    """
    def __init__(self):
        super().__init__(allowed_roles=["Administrador"])


class AdminRecepcionista(RolePermission):
    """!
    @brief Permiso combinado para **Administrador** y **Recepcionista**.
    @details
        Esta clase hereda de `RolePermission` y autoriza el acceso a
        usuarios cuyo `user.rol` sea `"Administrador"` o `"Recepcionista"`.

    @example
        permission_classes = [AdminRecepcionista]
    """
    def __init__(self):
        super().__init__(allowed_roles=["Administrador", "Recepcionista"])
