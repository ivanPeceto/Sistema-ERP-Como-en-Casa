/**
 * @file models.d.ts
 * @brief Define las interfaces de TypeScript para los modelos de datos principales de la aplicación.
 * @details Este archivo actúa como una única fuente de verdad para la estructura de los datos
 * que se manejan en el frontend, tanto los que se reciben de los microservicios del backend
 * como los que se envían a ellos.
 */

// --- Modelos de Microservicios ---

/**
 * @interface Cliente
 * @brief Define la estructura de un objeto Cliente.
 * @details Representa a un cliente del negocio con su información de contacto básica.
 */
export interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
  direccion?: string;
}

export type SocketMessage = {
    source: 'pedidos' | 'productos';
    action: 'create' | 'update' | 'delete';
    id?: number; 
    pedido?: Pedido;
    producto?: Producto;
}

/**
 * @interface Categoria
 * @brief Define la estructura de una categoría de productos.
 */
export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

/**
 * @interface Producto
 * @brief Define la estructura de un producto del catálogo.
 */
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  disponible: boolean;
  categoria: Categoria | null;
}

/**
 * @interface PedidoItem
 * @brief Representa un producto dentro de un pedido que se está armando en el frontend.
 * @details Extiende parcialmente la interfaz 'Producto' (haciendo sus campos opcionales)
 * y añade propiedades específicas del contexto de un pedido.
 * @extends Partial<Producto>
 */
export interface PedidoItem extends Partial<Producto> {
    id: number;
    nombre: string;
    precio_unitario: number;
    aclaraciones?: string;
    cantidad: number;
    subtotal: number;
}

/**
 * @interface Pedido
 * @brief Representa la estructura completa de un pedido tal como lo devuelve la API (lectura).
 * @details Contiene los datos maestros del pedido y un array con los detalles de los productos incluidos.
 */
export interface Pedido {
  id: number;
  numero_pedido: number;
  fecha_pedido: string; 
  cliente: string;
  para_hora: string | null; 
  estado: string; // 'PENDIENTE', 'LISTO', 'ENTREGADO'
  avisado: boolean;
  // Deprecated
  entregado: boolean;
  //--
  pagado: boolean;
  total: number;
  productos_detalle: {
      id_producto: number;
      nombre_producto: string;
      cantidad_producto: number;
      aclaraciones?: string;
      precio_unitario: number;
      subtotal: number;
  }[];
}

/**
 * @interface PedidoInput
 * @brief Representa el payload que se enviará al backend para crear o actualizar un pedido (escritura).
 * @details Esta estructura está diseñada para coincidir con lo que el 'PedidoSerializer' del backend
 * espera en su campo 'productos' de solo escritura.
 */
export interface PedidoInput {
    numero_pedido: number;
    fecha_pedido: string;
    cliente: string;
    para_hora: string | null; 
    estado: string; // 'PENDIENTE', 'LISTO', 'ENTREGADO'
    avisado: boolean;
    // Deprecated
    entregado: boolean;
    //--
    pagado: boolean;
    productos: {
        id_producto: number;
        nombre_producto: string;
        cantidad_producto: number;
        precio_unitario: number;
        aclaraciones?: string;
    }[];
}

// Unión de tipos para los estados de pedido para mayor seguridad de tipo
export type PedidoEstado = 'PENDIENTE' | 'LISTO' | 'ENTREGADO';


// --- Tipos de Autenticación ---

/**
 * @interface User
 * @brief Define la estructura de los datos del usuario.
 */
export interface User {
  id: number;
  email: string;
  nombre: string;
  is_superuser: boolean;
}

/**
 * @interface RefreshTokenResponse
 * @brief Define la estructura de la respuesta del endpoint de refresco de token.
 */
export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

/**
 * @interface AuthResponse
 * @brief Define la estructura de la respuesta del backend durante el login o registro.
 */
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * @interface ProductoInput
 * @brief Define la estructura para el input de un nuevo producto, usado en formularios.
 * @details Es similar a 'Producto' pero omite el campo 'id' generado por el backend automaticamente.
 */
export interface ProductoInput {
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  stock: number;
  disponible: boolean;
  categoria_id: number | null;
}


/**
 * @interface Insumo
 * @brief Define la estructura de un insumo.
 */
export interface Insumo {
    id: number;
    nombre: string;
    unidad_medida: string;
    stock_actual: number;
    costo_unitario: number;
}

/**
 * @interface RecetaInsumo
 * @brief Modelo intermedio que detalla un insumo dentro de una receta.
 */
export interface RecetaInsumo {
    insumo: Insumo;
    cantidad: number;

}

/**
 * @interface Receta
 * @brief Define la estructura de un objeto Receta tal como se recibe del backend (lectura).
 */
export interface Receta {
    id: number;
    nombre: string;
    descripcion: string;
    insumos: RecetaInsumo[];
}

/**
 * @interface RecetaInput
 * @brief Define la estructura para el input de una nueva receta, usado en formularios (escritura).
 */
export interface RecetaInput {
    nombre: string;
    descripcion: string;
    insumos_data: {
        insumo_id: number;
        cantidad: number;
    }[];
}

/**
 * @interface MetodoCobro
 * @brief Define la estructura de un método de cobro.
 */
export interface MetodoCobro {
    id: number;
    nombre: string;
}

/**
 * @interface Cobro
 * @brief Define la estructura de un cobro.
 * @details Representa un pago o abono asociado a un pedido.
 */
export interface Cobro {
    id: number;
    pedido: number;
    monto: number;
    moneda: string;
    id_metodo_cobro: number;
    metodo_cobro: MetodoCobro; 
    descuento: number;
    recargo: number;
    descuento_porcentual: number;
    recargo_porcentual: number;
    monto_restante: number;
    pagado_completo?: boolean;
}

/**
 * @interface CobroInput
 * @brief Define la estructura para el payload de creación/edición de un cobro.
 */
export interface CobroInput {
    pedido: number;
    id_metodo_cobro: number;
    monto?: number; 
    moneda?: string;
    descuento?: number;
    recargo?: number;   
    descuento_porcentual?: number; 
    recargo_porcentual?: number;   
}