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
  telefono: string;
  direccion: string;
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
  stock: number;
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
  id_cliente: number;
  para_hora: string | null; 
  entregado: boolean;
  pagado: boolean;
  total: number;
  productos_detalle: {
      id_producto: number;
      nombre_producto: string;
      cantidad_producto: number;
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
    id_cliente: number;
    para_hora: string | null; 
    entregado: boolean;
    pagado: boolean;
    productos: {
        id_producto: number;
        nombre_producto: string;
        cantidad_producto: number;
        precio_unitario: number;
    }[];
}


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