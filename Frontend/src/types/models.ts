/**
 * @file models.d.ts
 * @brief Define las interfaces de TypeScript para los modelos de datos principales de la aplicación.
 */

// --- Modelos de Microservicios ---

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  precio_por_bulto: number;
  stock: number;
  disponible: boolean;
  categoria: Categoria | null;
}

/**
 * @brief Representa un producto dentro de un pedido que se está armando en el frontend.
 * @extends Producto
 */
export interface PedidoItem extends Producto {
    cantidad: number;
    subtotal: number;
}

/**
 * @brief Representa un pedido tal como lo devuelve la API (lectura).
 */
export interface Pedido {
  id: number;
  numero_pedido: number;
  fecha_pedido: string; 
  id_cliente: number;
  para_hora: string | null; 
  entregado: boolean;
  pagado: boolean;
  total: number; // Campo total que viene del backend
  productos_detalle: {
      id_producto: number;
      nombre_producto: string;
      cantidad_producto: number;
      precio_unitario: number;
      subtotal: number; // El subtotal también viene en los detalles
  }[];
}

/**
 * @brief Representa el payload que se enviará al backend para crear o actualizar un pedido (escritura).
 */
export interface PedidoInput {
    numero_pedido: number;
    fecha_pedido: string; 
    id_cliente: number;
    para_hora: string | null; 
    entregado: boolean;
    pagado: boolean;
    // Este es el campo que el backend espera para la escritura
    productos: {
        id_producto: number;
        nombre_producto: string;
        cantidad_producto: number;
        precio_unitario: number;
    }[];
}

// --- Tipos de Autenticación ---

export interface User {
  id: number;
  email: string;
  nombre: string;
  is_superuser: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

/**
 * @brief Define la estructura para el input de un nuevo producto, usado en formularios.
 */
export interface ProductoInput {
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  precio_por_bulto: number;
  stock: number;
  disponible: boolean;
  categoria_id: number | null;
}