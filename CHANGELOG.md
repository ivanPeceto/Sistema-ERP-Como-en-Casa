## [ refactor/back/client ] - 2025-10-22

_(Cambios realizados por @ivanPeceto)_

### Observations

### Refactors
* Restaura lo ya existente en el contenedor de clientes comentado en `docker-compose.yml.template` y `nginx.conf.template`.
* Añade directivas de migraciones al script de instalación `./start_server.sh`.

### Affects
* `docker-compose.yml.template`
* `nginx.conf.template`
* `./start_server.sh`

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