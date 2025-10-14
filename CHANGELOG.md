## [ fix/merge/cobros-ui ] - 2025-10-13

## Implements
* Implementa funcionalmente el modal de cobros.

## Refactors
* Cambia funcionalidad del botón "Ver" en la card de pedido para deplegar el modal de cobros.

## Improvements
* Elimina comentarios innecesarios y bloques comentados por desuso. 

## Affects
* `GestionPedidosPage.tsx`

## [ merge/feature/modales ] - 2025-10-11

### Bug Fixes
* (1) Al crear un pedido nuevo, este se crea en el backend pero no se muestra en el frontend. 
* (2) Al craer un pedido nuevo, este toma siempre el "numero de pedido" de valor 1.

### Changed
* Removido `fetchInitialDataParent` como prop en el  modal de creación de pedidos debido a que junto  al websocket produce un doble llamado a la bdd. Este cambio corrige el bug (1).
* Refactorizada la búsqueda de pedidos por fecha en `PedidoListView` para ser consistente con los otros métodos. Corrige el bug (2).

### Affects
* `GestionPedidosPage.tsx`
* `CrearPedidoModal.tsx`
* `apps/pedidos/views.py`