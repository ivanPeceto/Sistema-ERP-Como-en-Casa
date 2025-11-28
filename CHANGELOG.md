# Changelog

## [ fix/back/cobros-refac-issues ] - 2025/11/28

### Changed
* Refactoriza los estilos en el modal de creacion de cobros.

### Adds
* `Frontend/src/components/modals/CrearEditarCobroModal/CrearEditarCobroModal.module.css`

### Affects
* `Frontend/src/components/modals/CrearEditarCobroModal/CrearEditarCobroModal.tsx`

## [ fix/back/cobros-refac-issues ] - 2025/11/28

### Changed
* Corrige problemas de actualizacion de total a pagar en los modales de cobros.

### Affects
* `Frontend/src/components/modals/GestionCobrosModal/GestionCobrosModal.tsx`
+ `Frontend/src/components/modals/CrearEditarCobroModal/CrearEditarCobroModal.tsx`

## [ fix/back/cobros-refac-issues ] - 2025/11/27

### Changed
* Parsea los datos a decimales en la variable `total` dentro del método `calcular_total` en `/pedidos/models.py`.
* Reemplaza en `/pedidos/models.py` el método `total_ajustado` por `calcular_credito_real` para corregir errores matemáticos en el cálculo de cobros.
* Adapta la lógica del serializer de pedidos para seguir las reglas de calculos ajustados.
* Refactoriza la lógica en `cobros/views.py`.

### Affects
* `backend/service_pedidos/apps/pedidos/models.py`
* `backend/service_pedidos/apps/pedidos/serializer.py`
* `backend/service_pedidos/apps/cobros/views.py`

_(Cambios realizados por @ivanPeceto)_

## [ fix/front/user-roles-implementation ] - 2025/11/26

_(Cambios realizados por @ivanPeceto)_

### Changed
* Refactoriza la lógica de muestra de items  en el sidebar para que algunos iconos sean visibles solo por ciertos usuarios.

### Affects
* `Frontend/src/components/sidebar/sidebar.tsx`

## [feature/frontend/cobros-refac] – 2025-11-25

*(Cambios realizados por @jmrodriguezspinker)*

### Adds

* Nuevos modales y componentes en frontend para **gestión de cobros y pedidos**:
  * `CrearEditarCobroModal`, `CrearPedidoModal`, `GestionCobrosModal`.
* Agregado submenu de **Administración** en el sidebar.
* Nueva página de **gestión de usuarios**: `GestionUsuariosPage` con su servicio `user_service` y estilos asociados.
* Integración de fixtures para poblar tablas en todos los microservicios backend.
* Migraciones nuevas para pedidos con ajustes en campos booleanos (`0002`, `0003`, `0004`).

### Refactors

* Refactor de servicios de frontend:
  * `client_service` y `cobro_service` actualizados para alinearse con backend.
  * Eliminación de `metodo_cobro_service`.
* Refactor de modelos en frontend:
  * Ajustes en `Pedido`, `PedidoInput`, `PedidoItem` y agregado de `UserForm`.
* Refactor en backend:
  * Modelos y serializers de `pedidos` actualizados.
  * Ajustes en vistas y permisos de `clientes` y `usuarios`.

### Fixes

* Backend:
  * Corrección de serializer de `usuarios` para CRUD de administradores.
  * Ajustes en la autenticación JWT y permisos de acceso (`AdminOnly`).

### Removes / Chores

* Eliminación de `GestionMetodosCobroView.tsx` en frontend.
* Actualización de dockerignore en todos los microservicios y frontend.
* Ajustes de infraestructura:
  * `docker-compose.yml.template`, `nginx.conf.template` y scripts para habilitar microservicio Clientes.

### Affects

**Frontend**

* `Frontend/src/components/modals/CrearEditarCobroModal/CrearEditarCobroModal.tsx`
* `Frontend/src/components/modals/CrearPedidoModal/CrearPedidoModal.tsx`
* `Frontend/src/components/modals/GestionCobrosModal/GestionCobrosModal.tsx`
* `Frontend/src/components/sidebar/sidebar.module.css`
* `Frontend/src/components/sidebar/sidebar.tsx`
* `Frontend/src/pages/GestionClientesPage.tsx`
* `Frontend/src/pages/GestionPedidosPage.tsx`
* `Frontend/src/pages/GestionUsuariosPage.tsx`
* `Frontend/src/router/index.tsx`
* `Frontend/src/router/protected_route.tsx`
* `Frontend/src/services/client_service.ts`
* `Frontend/src/services/cobro_service.ts`
* `Frontend/src/services/user_service.ts`
* `Frontend/src/types/models.ts`
* `Frontend/src/styles/gestionUsuariosPage.module.css`
* `Frontend/.dockerignore`

**Backend**

* `backend/service_clientes/apps/authentication/jwt_auth.py`
* `backend/service_clientes/apps/clientes/views.py`
* `backend/service_clientes/utils/permissions.py`
* `backend/service_clientes/.dockerignore`
* `backend/service_pedidos/apps/cobros/views.py`
* `backend/service_pedidos/apps/cobros/fixture/`
* `backend/service_pedidos/apps/pedidos/models.py`
* `backend/service_pedidos/apps/pedidos/serializer.py`
* `backend/service_pedidos/apps/pedidos/fixture/`
* `backend/service_pedidos/apps/pedidos/migrations/0002_alter_pedido_avisado_alter_pedido_entregado_and_more.py`
* `backend/service_pedidos/apps/pedidos/migrations/0003_pedido_descuento_total.py`
* `backend/service_pedidos/apps/pedidos/migrations/0004_remove_pedido_descuento_total.py`
* `backend/service_pedidos/apps/pedidosProductos/fixture/`
* `backend/service_pedidos/.dockerignore`
* `backend/service_productos/apps/categorias/fixture/`
* `backend/service_productos/apps/insumos/fixture/`
* `backend/service_productos/apps/productos/fixture/`
* `backend/service_productos/apps/recetas/fixture/`
* `backend/service_productos/.dockerignore`
* `backend/service_usuarios/apps/roles/fixture/`
* `backend/service_usuarios/apps/usuarios/fixture/`
* `backend/service_usuarios/apps/usuarios/serializer.py`
* `backend/service_usuarios/apps/usuarios/tests.py`
* `backend/service_usuarios/apps/usuarios/urls.py`
* `backend/service_usuarios/apps/usuarios/views.py`
* `backend/service_usuarios/utils/permissions.py`
* `backend/service_usuarios/.dockerignore`
* `docker-compose.yml.template`
* `nginx/nginx.conf.template`

## [feature/frontend/cobros-refac] – 2025-11-17

*(Cambios realizados por @jmrodriguezspinker)*

### Adds

* Agregada la dependencia **jwt-decoder** en el frontend para permitir la lectura de roles desde el token.
* Integración de **gestión de roles en frontend**: nueva página `GestionRolesPage`, servicio `role_service` y estilos asociados.
* Nuevos **tipos globales** en `types.ts` y reorganización de la estructura de `types`.
* Agregado módulo `auth/` en frontend para la **decodificación del token JWT**.
* Agregado **stock** al formData en el modal de creación de productos para alinearlo con el backend.

### Refactors

* Refactor del sistema de autenticación del frontend:

  * Inclusión del **token** dentro de `AuthContextType` y `AuthProvider`.
  * Actualización de rutas protegidas para soportar **restricción por roles**.
* Refactor de modales de **crear y editar cobros** para alinearlos con el nuevo modelo del backend.
* Ajustes en `cobro_service` y en los modelos de frontend (`Cobro` y `CobroInput`) para reflejar el modelo del backend.
* Limpieza y reorganización de imports y estructura de `index.ts` en types.

### Fixes

* Corrección de modelos, serializers y tests del backend:

  * Ajustes en modelos y serializers de `pedidos`.
  * Correcciones en los tests de los módulos de `cobros` y `pedidos`.
* Corrección del serializer de **usuarios** para alinearlo con cambios recientes del backend.

### Removes / Chores

* Reorganización de los puntos de acceso a tipos mediante `types/index.ts`.
* Ajustes menores de estructura en frontend para facilitar el uso de modelos y types.

### Affects

**Frontend**

* `Frontend/package.json`
* `Frontend/package-lock.json`
* `Frontend/src/components/modals/CrearEditarCobroModal/CrearEditarCobroModal.tsx`
* `Frontend/src/components/modals/GestionCobrosModal/GestionCobrosModal.tsx`
* `Frontend/src/services/cobro_service.ts`
* `Frontend/src/types/models.ts`
* `Frontend/src/components/modals/CrearProductoModal.tsx`
* `Frontend/src/context/auth_context.tsx`
* `Frontend/src/router/index.tsx`
* `Frontend/src/router/protected_route.tsx`
* `Frontend/src/pages/GestionRolesPage.tsx`
* `Frontend/src/services/role_service.ts`
* `Frontend/src/styles/gestionRolesPage.module.css`
* `Frontend/src/types/types.ts`
* `Frontend/src/types/index.ts`
* `Frontend/src/auth/`

**Backend**

* `backend/service_pedidos/apps/cobros/tests.py`
* `backend/service_pedidos/apps/pedidos/models.py`
* `backend/service_pedidos/apps/pedidos/serializer.py`
* `backend/service_pedidos/apps/pedidos/tests.py`
* `backend/service_usuarios/apps/usuarios/serializer.py`


## [feature/backend/cobros-design] – 2025-11-12

_(Cambios realizados por @jmrodriguezspinker)_

### Adds

* Implementación de **Abstract Factory** y **Decorators** en `cobros` para mejorar la extensión de tipos de cobro.
* Nuevas migraciones para `cobros` y `usuarios` (`0002_cobro_estado`, `0002_alter_usuario_rol`).
* Nuevos archivos de soporte para cobros: `decorators.py` y `factories.py`.

### Refactors

* Actualización de la autenticación JWT y permisos en varios microservicios (`pedidos`, `productos`) para reflejar cambios en el token (`roles[]` → `rol(string)`).
* Refactor de modelos, serializers, views y URLs de `cobros` para acomodar abstract factory y decorators.
* Refactor de modelos y serializers de `pedidos` para alinearse con la nueva lógica de negocio.
* Limpieza y reorganización de migraciones obsoletas en `cobros`, `pedidos` y `pedidosProductos`.
* Actualización de configuración: `settings.py`, URLs y `requirements.txt` (incluye django-filter y eliminación de app obsoleta `metodos`).

### Fixes

* Reemplazo de `rol_nombre` por `rol` como campo readonly en serializers de `usuarios`.
* Ajuste de vistas en `usuarios` para reemplazar `roles[]` por `rol(string)`.

### Removes / Chores

* Eliminación completa de la app `metodos` y sus migraciones asociadas.
* Eliminación de migraciones antiguas en `cobros`, `pedidos` y `pedidosProductos`.

### Affects

* `/backend/service_pedidos/apps/authentication/jwt_auth.py`
* `/backend/service_productos/apps/authentication/jwt_auth.py`
* `/backend/service_pedidos/utils/permissions.py`
* `/backend/service_productos/utils/permissions.py`
* `/backend/service_pedidos/apps/cobros/models.py`
* `/backend/service_pedidos/apps/cobros/serializer.py`
* `/backend/service_pedidos/apps/cobros/views.py`
* `/backend/service_pedidos/apps/cobros/urls.py`
* `/backend/service_pedidos/apps/cobros/tests.py`
* `/backend/service_pedidos/apps/cobros/decorators.py`
* `/backend/service_pedidos/apps/cobros/factories.py`
* `/backend/service_pedidos/apps/pedidos/models.py`
* `/backend/service_pedidos/apps/pedidos/serializer.py`
* `/backend/service_pedidos/apps/cobros/migrations/0002_cobro_estado.py`
* `/backend/service_usuarios/apps/usuarios/migrations/0002_alter_usuario_rol.py`
* `/backend/service_pedidos/apps/pedidosProductos/migrations/0001_initial.py`
* `/backend/service_pedidos/orders/settings.py`
* `/backend/service_pedidos/orders/urls.py`
* `/backend/service_pedidos/requirements.txt`
* `/backend/service_usuarios/apps/usuarios/serializer.py`
* `/backend/service_usuarios/apps/usuarios/views.py`


## [feature/backend/cobros-refac] – 2025-11-10

_(Cambios realizados por @jmrodriguezspinker)_

### Adds

* Adaptación de vistas en varios microservicios (`usuarios`, `roles`, `productos`, `pedidos`, `cobros`) para usar `AllowRoles`.
* Tests actualizados y nuevos para `AllowRoles` en auth y permisos.

### Refactors

* Reemplazo de `IsSuperUser` por `AllowRoles` en permisos personalizados (`permissions.py`) de todos los microservicios.
* Adaptación de JWT auth para nuevos requerimientos de roles y restricción de unicidad.
* Renombramiento de clases a PascalCase en serializers y apps para consistencia.

### Hotfix

* Corrección de errores en el cálculo de cobros en `backend/service_pedidos/apps/cobros/serializer.py`.

### Affects

* `/backend/service_usuarios/apps/roles/`
* `/backend/service_usuarios/apps/usuarios/views.py`
* `/backend/service_usuarios/utils/permissions.py`
* `/backend/service_productos/apps/categorias/views.py`
* `/backend/service_productos/apps/insumos/views.py`
* `/backend/service_productos/apps/productos/views.py`
* `/backend/service_productos/apps/recetas/views.py`
* `/backend/service_productos/utils/permissions.py`
* `/backend/service_pedidos/apps/cobros/views.py`
* `/backend/service_pedidos/apps/metodos/views.py`
* `/backend/service_pedidos/apps/pedidos/views.py`
* `/backend/service_pedidos/utils/permissions.py`
* `/backend/service_pedidos/apps/authentication/jwt_auth.py`
* `/backend/service_productos/apps/authentication/jwt_auth.py`
* `/backend/service_productos/apps/categorias/serializer.py`
* `/backend/service_pedidos/apps/cobros/serializer.py`
* `/backend/service_pedidos/apps/cobros/tests.py`
* `/backend/service_pedidos/apps/metodos/tests.py`
* `/backend/service_pedidos/apps/pedidos/tests.py`
* `/backend/service_productos/apps/categorias/tests.py`
* `/backend/service_productos/apps/insumos/tests.py`
* `/backend/service_productos/apps/productos/tests.py`
* `/backend/service_productos/apps/recetas/tests.py`
* `/backend/service_usuarios/apps/roles/tests.py`

## [ chore/documentation ] - 2025-10-30

_(Cambios realizados por @ivanPeceto)_

### Changed
* Renueva la presentación en `README.md` para volverlo más atractivo y ajustarse a la presentación actual.

### Affects
* `README.md`
## [feature/backend/roles] – 2025-10-27

_(Cambios realizados por @jmrodriguezspinker)_

### Adds

* Agrega modelo `Rol` y su serializer, vistas, urls y migraciones iniciales.
* Management command `seed_usuarios` para crear roles base y usuario admin.
* Permisos personalizados en `permissions.py` para restringir rutas según rol.
* URLs de usuarios para login, signup y refresh token.

### Refactors

* Re-crea migraciones de `Usuario` para incluir el campo `rol`.
* Actualiza serializers de `Usuario` para incluir `rol`.
* Relaciona `Usuario` con `Rol` en el modelo.
* Ajusta `settings.py` y `urls.py` del proyecto para integración con roles y auth.

### Chore

* Se agrega `__init__.py` para marcar `apps` como paquete Python.
* Modifica `start_server.sh`: se elimina `create_superuser` y se agregan seeders.

### Affects

* `/backend/service_usuarios/apps/roles/`
* `/backend/service_usuarios/apps/usuarios/migrations/`
* `/backend/service_usuarios/apps/usuarios/models.py`
* `/backend/service_usuarios/apps/usuarios/serializer.py`
* `/backend/service_usuarios/apps/usuarios/urls.py`
* `/backend/service_usuarios/utils/permissions.py`
* `/backend/service_usuarios/apps/usuarios/management/commands/seed_usuarios.py`
* `/backend/service_usuarios/users/settings.py`
* `/backend/service_usuarios/users/urls.py`
* `start_server.sh`

## [ refactor/front/client ] - 2025-10-23

_(Cambios realizados por @ivanPeceto)_

### Observations
* Se podría unificar el css de la mayoría de páginas de gestion para usar un solo archivo global que tenga los estilos generales.

### Changed
* Vuelve a añadir "clientes" al footer.
* Actualiza css para ser consistente con el resto de diseños.
* Cambia el import de css en `GestionClientesPage.tsx` para usar el de `GestionProductosPage.tsx`

### Affects
* `/Frontend/src/components/sidebar/sidebar.tsx`
* `/Frontend/src/styles/gestionClientesPage.module.css`
* `/Frontend/src/pages/GestionClientesPage.tsx`

## [ refactor/front/client ] - 2025-10-23

_(Cambios realizados por @ivanPeceto)_

### Refactors
* Cambia los campos `telefono` y `direccion` en `models.ts` para ser opcionales. 
* Integra nuevo sistema de sugerencias de clientes por fuzzy search en `CrearPedidoModal.tsx`.

### Bugfix
* Faltaba descomentar un bloque en `nginx.conf.template.
* Corrige el serializer de pedidos.
* Corrige inconsistencia en el método de fuzzy search del microservicio de clientes.

### Adds
* Nuevo método en `client_service.ts` para llamar al nuevo endpoint de client fuzzy search. 
* Estilos para las coincidencias de búsqueda.

### Affects
* `/Frontend/src/components/modals/CrearPedidoModal/CrearPedidoModal.tsx`
* `/Frontend/src/services/client_service.ts`
* `/Frontend/src/types/models.ts`
* `nginx.conf.template`
* `/backend/service_clientes/apps/clientes/views.py`
* `/backend/service_pedidos/apps/pedidos/serializer.py`

## [ refactor/back/client ] - 2025-10-22

_(Cambios realizados por @ivanPeceto)_

### Refactors
* Restaura lo ya existente en el contenedor de clientes comentado en `docker-compose.yml.template` y `nginx.conf.template`.
* Añade directivas de migraciones al script de instalación `./start_server.sh`.
* Elimina el campo `id_cliente` en `models.py` y `models.ts` de pedidos.
* Adapta payloads para coincidir con la refactorización de id_cliente en `CrearPedidoModal.tsx` y `EditarPedidoModal.tsx`

### Adds
* Nuevo endpoint en el microservicio de clientes para devolver mejores coincidencias con un nombre en el payload.

### Affects
* `docker-compose.yml.template`
* `nginx.conf.template`
* `./start_server.sh`
* `/backend/service_pedidos/apps/pedidos/models.py`
* `/Frontend/src/types/models.ts`
* `CrearPedidoModal.tsx` y `EditarPedidoModal.tsx`
* `/backend/service_clientes/apps/clientes/views.py`
* `/backend/service_clientes/clients/urls.py`
# Changelog 

## [ refactor/back/cobros ] - 2025-10-17

_(Cambios realizados por @ivanPeceto)_

### Observations
* El modal de cobros refactorizado ahora muestra números negativos en el "Restante" si el total de los pagos excede el total del pedido. Lo corrijo para evitar confusiones de parte del usuario.
* El input de monto al crear un cobro siiempre está vacío. Una mejora de UX sería llenar ese input con el monto restante automáticamente.
* Todos los campos de los modales de cobros tienen los valores númericos con 2 dígitos decimales. En nuestro contexto argentino esto solo hace ruido visual.
* El serializer de cobros no maneja bien los aumentos ni descuentos.

### Changed
* Campos númericos de `GestionCobroModal.tsx` y `CrearEditarCobroModal.tsx` cambiados para no mostrar decimales.
* Corregido el comportamiento del campo "Restante" en  el  modal de `GestionCobroModal.tsx` descrito en las observaciones.
* Corregido el comportamiento del campo "monto" en `CrearEditarCobroModal.tsx` descrito  en las observaciones.
* Corrige el funcionamiento de `serializer.py` en el backend de cobros.
* Elimina aclaraciones de texto innecesarios en los modales de cobros.

### Affects
* `GestionCobroModal.tsx`
* `CrearEditarCobroModal.tsx`
* `service_pedidos/apps/cobros/serializer.py`

## [ refactor/back/cobros ] - 2025-10-16

_(Cambios realizados por @ivanPeceto)_

### Observations
* El módulo de cobros contenía una sección de lógica que impedía crear cobros una vez alcanzado el monto a abonar del pedido. Esto por diversas razones es impráctico y poco flexible por lo que se refactorizó el `serializer.py`.

### Changed
* Se refactorizó la lógica en `serializer.py` del backend de cobros para ser más flexible.
* Para acompañar estos cambios se refactorizaron los archivos relacionados en el frontend.
* Refactorizado el valor `montoRestante` y `totalAbonadoo` en `GestionCobrosModal.tsx` para tomar valores del backend mejorando la UX.

### Added
* Nuevo método `createFullPaymentCobro` en `cobro_service.ts`.
* Nuevos inputs en el formulario de `CrearEditarCobrosModal.tsx` para los aumentos/descuentos porcentuales.


### Affects
* `service_pedidos/apps/cobros/serializer.py`
* `service_pedidos/apps/cobros/models.py`
* `models.ts`
* `CrearEditarCobroModal.tsx`
* `cobro_service.ts`

## [ fix/front/cobros-modal ] - 2025-10-15

_(Cambios realizados por @ivanPeceto)_

### Observations
* Al apretar el botón de cerrar en el modal de cobros, no se cierra.
* Hay inconsistencias entre el frontend de cobros y el backend. Se calcula a mano el monto restante y el total abonado cuando esta información ya es devuelta por el backend.
* El manejo de inputs como tipo "number" en el modal `CrearEditarCobroModal.tsx` da un mal UX al no permitir borrar el 0 inicial, produciendo situaciones donde el usuario quiere escribir "1" pero como el 0 no se puede borrar se escribe "01".
* El modal `CrearEditarCobroModal.tsx` no tiene documentación.

### Changed
* El callback `closeCobrosModal` en `GestionPedidosPage.tsx` afectaba al estado equivocado. Se corrigió para que afecte a `setIsCobrosModalOpen`.

### Refactored
* Ahora en `GestionCobroModal.tsx` se hace provecho de la información del backend para calcular `montoRestante` y `totalAbonado` en vez de calcularlos a mano.
* Ajusta el tipo `Cobro` en `types/models.ts`
* Cambia el tipo de los inputs del formulario `CrearEditarCobroModal.tsx` de "number" a "string"

### Added
* Documentación estilo doxygen a `CrearEditarCobroModal.tsx`.

### Affects
* `GestionPedidosPage.tsx`
* `GestionCobrosModal.tsx`
* `models.ts`
* `CrearEditarCobroModal.tsx`

## [ fix/merge/cobros-ui ] - 2025-10-13

_(Cambios realizados por @ivanPeceto)_

### Observations
* Al intentar crear un cobro el cliente llama a la url `api/cobros/crear/` pero esta no está registrada en el reverse proxy por lo que el propio cliente responde con 404.

### Implements
* Implementa funcionalmente el modal de cobros.

### Refactors
* Cambia funcionalidad del botón "Ver" en la card de pedido para deplegar el modal de cobros.

### Improvements
* Elimina comentarios innecesarios y bloques comentados por desuso. 
* Agrupa endpoints según el módulo específico al que respondan para facilitar la lectura del código.

### Affects
* `GestionPedidosPage.tsx`
* `GestionCobrosModal.tsx`
* `GestionMetodosCobroView.tsx`
* `CrearEditarCobroModal.tsx`

## [ merge/feature/modales ] - 2025-10-11

### Bug Fixes
* (1) Al crear un pedido nuevo, este se crea en el backend pero no se muestra en el frontend. 
* (2) Al craer un pedido nuevo, este toma siempre el "numero de pedido" de valor 1.

### Changed
* Removido `fetchInitialDataParent` como prop en el  modal de creación de pedidos debido a que junto  al websocket produce un doble llamado a la bdd. Este cambio corrige el bug (1).
* Refactorizada la búsqueda de pedidos por fecha en `PedidoListView` para ser consistente con los otros métodos. Corrige el bug (2).
* Divide los `url.py` del backend de pedidos y productos en submódulos para agruparlos evitando repetir patrones como _"api/pedidos/cobros/"_ en cáda endpoint.
* Añade prefijo `api/pedidos` a los endpoint de cobros y metodos de cobro para poder ser reconocidos por el reverse proxy.
* Corrige los endpoints en los servicios de cobro y metodos de cobro del frontend.

### Affects
* `GestionPedidosPage.tsx`
* `CrearPedidoModal.tsx`
* `apps/pedidos/views.py`
* `cobro_service.tsx`
* Archivos `urls.py` en microservicio de pedidos y productos.
* `cobro_service.ts`
* `metodo_service.ts`