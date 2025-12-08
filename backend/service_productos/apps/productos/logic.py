from django.db import transaction
from decimal import Decimal

def descontar_stock_recursivo_receta(receta, cantidad_consumida):
    """
    Descuenta recursivamente los stocks de insumos de una receta y sus sub-recetas.
    """
    # Descontar Insumos directos
    for receta_insumo in receta.recetainsumo_set.all():
        insumo = receta_insumo.insumo
        cantidad_necesaria = receta_insumo.cantidad * cantidad_consumida
        nuevo_stock = insumo.stock_actual - cantidad_necesaria
        insumo.stock_actual = max(Decimal('0.00'), nuevo_stock)
        insumo.save()

    # Descontar insumos en Sub-recetas (Recursión)
    for sub_detalle in receta.recetasubreceta_principal.all():
        sub_receta = sub_detalle.receta_hija
        cantidad_sub_necesaria = sub_detalle.cantidad * cantidad_consumida
        descontar_stock_recursivo_receta(sub_receta, cantidad_sub_necesaria)

def procesar_venta_producto(producto, cantidad_vendida):
    """
    - Si tiene receta -> descuenta insumos.
    - Si no tiene receta -> descuenta stock directo.
    """
    cantidad_vendida = Decimal(cantidad_vendida)

    with transaction.atomic():
        if producto.receta:
            total_receta_a_consumir = producto.cantidad_receta * cantidad_vendida
            descontar_stock_recursivo_receta(producto.receta, total_receta_a_consumir)
        else:
            if producto.stock is not None:
                nuevo_stock = producto.stock - int(cantidad_vendida)
                producto.stock = max(0, nuevo_stock)
                producto.save()