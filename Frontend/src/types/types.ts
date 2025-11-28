// types.ts
export const METODO_COBRO = {
  efectivo: "Efectivo",
  debito: "Débito",
  credito: "Crédito",
  mercadopago: "Mercado Pago",
} as const;

export const ESTADO_COBRO = {
  activo: "Activo",
  cancelado: "Cancelado"
} as const;

export type MetodoCobro = keyof typeof METODO_COBRO;

export type EstadoCobro = keyof typeof ESTADO_COBRO;

export type PedidoEstado = 'PENDIENTE' | 'LISTO' | 'ENTREGADO';

export const METODO_COBRO_LABELS: Record<MetodoCobro, string> = {
    efectivo: "Efectivo",
    debito: "Débito",
    credito: "Crédito",
    mercadopago: "Mercado Pago"
};