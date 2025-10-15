
## [ fix/front/cobros-modal ] - 2025-10-15

### Observations
* Al apretar el botón de cerrar en el modal de cobros, no se cierra.

### Changed
* El callback `closeCobrosModal` en `GestionPedidosPage.tsx` afectaba al estado equivocado. Se corrigió para que afecte a `setIsCobrosModalOpen`.

### Affects
* `GestionPedidosPage.tsx`

###

## [ fix/merge/cobros-ui ] - 2025-10-13

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