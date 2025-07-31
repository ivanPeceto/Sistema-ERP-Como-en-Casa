```mermaid
sequenceDiagram
    participant Frontend
    participant BackendClientes as Backend-MSClientes
    participant JWTAuthentication
    participant IsAdminOrReadOnly as IsSuperUser
    participant ClienteViewSet
    participant Database as DB Clientes

    Frontend->>BackendClientes: 1. PUT /editar/?id={id}/ (con token JWT y datos)
    
    Note over BackendClientes: DRF ejecuta la autenticación primero.
    BackendClientes->>JWTAuthentication: 2. authenticate(request)
    activate JWTAuthentication
    
    Note right of JWTAuthentication: 3. Lógica interna de authenticate():<br/>- Valida LOCALMENTE la firma y expiración del token.<br/>- Extrae el payload del usuario ({..., is_superuser}) del token.<br/>- Crea un objeto FalseUser con esos datos.
    
    JWTAuthentication-->>BackendClientes: 4. Retorna el 'FalseUser' como usuario autenticado
    deactivate JWTAuthentication
    
    Note over BackendClientes: Con el usuario autenticado, DRF ejecuta los permisos.
    BackendClientes->>IsAdminOrReadOnly: 5. has_permission(request, view)
    activate IsAdminOrReadOnly

    alt Rol es Administrador (request.user.is_superuser == true)
        Note right of IsAdminOrReadOnly: El usuario es admin. Permiso concedido.
        IsAdminOrReadOnly-->>BackendClientes: 6a. Retorna True
        deactivate IsAdminOrReadOnly
        
        BackendClientes->>ClienteViewSet: 7a. Enruta la solicitud al método 'update'
        activate ClienteViewSet
        
        ClienteViewSet->>Database: 8a. UPDATE clientes_cliente SET ...
        activate Database
        Database-->>ClienteViewSet: 9a. Confirma la actualización
        deactivate Database
        
        ClienteViewSet-->>BackendClientes: 10a. Retorna los datos actualizados
        deactivate ClienteViewSet
        
        BackendClientes-->>Frontend: 11a. 200 OK (con datos del cliente)
        
    else Rol es Usuario (request.user.is_superuser == false)
	    activate IsAdminOrReadOnly
        Note right of IsAdminOrReadOnly: El usuario no es admin. Permiso denegado.
        IsAdminOrReadOnly-->>BackendClientes: 6b. Retorna False
        deactivate IsAdminOrReadOnly
        
        BackendClientes-->>Frontend: 7b. 403 Forbidden (Error de Permiso)
    end
    

```
Se realizó el análisis del diagrama únicamente con el endpoint de editar clientes ya que este abarca todas las características comunes al resto (Procesar request, autenticación, permisos de superusuario, etc...)