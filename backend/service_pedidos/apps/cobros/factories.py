from abc import ABC, abstractmethod

class Cobro(ABC):
    """!
    @brief Clase base abstracta para representar un cobro o transacción.
    @details
        Define los atributos básicos de cualquier cobro:
        - monto
        - fecha
        - moneda (default 'ARS')
        
        Incluye métodos para obtener el monto y la fecha, y un método abstracto
        `detalle()` que debe ser implementado por las subclases para retornar
        una descripción legible del cobro.
    @attributes
        monto : Decimal
            Monto de la transacción.
        fecha : date
            Fecha de la transacción.
        moneda : str
            Moneda de la transacción. Default: 'ARS'.
    @methods
        detalle() -> str
            Método abstracto que retorna una descripción del cobro.
        obtener_monto() -> Decimal
            Retorna el monto de la transacción.
        obtener_fecha() -> date
            Retorna la fecha de la transacción.
    """
    _contador = 0

    def __init__(self, monto, fecha, moneda='ARS'):
        self.monto = monto
        self.fecha = fecha
        self.moneda = moneda
    
    @abstractmethod
    def detalle(self):
        """Retorna un string descriptivo del cobro."""
        pass
    
    def obtener_monto(self):
        return self.monto
    
    def obtener_fecha(self):
        return self.fecha


class CobroEfectivo(Cobro):
    """! Cobro realizado en efectivo """
    def __init__(self, monto, fecha):
        super().__init__(monto, fecha)

    def detalle(self):
        return f"Transacción: {self.monto} {self.moneda} en efectivo el {self.fecha}"


class CobroElectronico(Cobro, ABC):
    """! Clase base para cobros electrónicos, incluye referencia de transacción """
    def __init__(self, monto, fecha, referencia):
        super().__init__(monto, fecha)
        self.referencia = referencia


class CobroTarjeta(CobroElectronico, ABC):
    """! Clase base para cobros con tarjeta (débito/crédito) """
    def __init__(self, monto, fecha, tipo, banco, referencia):
        super().__init__(monto, fecha, referencia)
        self.tipo = tipo
        self.banco = banco


class CobroDebito(CobroTarjeta):
    """! Cobro con tarjeta de débito """
    def detalle(self):
        return (
            f"Transacción: Débito {self.tipo} {self.banco}, "
            f"{self.monto} {self.moneda}, ref: {self.referencia}, fecha: {self.fecha}"
        )


class CobroCredito(CobroTarjeta):
    """! Cobro con tarjeta de crédito """
    def __init__(self, monto, fecha, tipo, banco, referencia, cuota):
        super().__init__(monto, fecha, tipo, banco, referencia)
        self.cuota = cuota

    def detalle(self):
        return (
            f"Transacción: Crédito {self.tipo} {self.banco}, "
            f"{self.monto} {self.moneda} en {self.cuota} cuotas, "
            f"ref: {self.referencia}, fecha: {self.fecha}"
        )


class CobroMercadoPago(CobroElectronico):
    """! Cobro realizado a través de Mercado Pago """
    def __init__(self, monto, fecha, referencia):
        super().__init__(monto, fecha, referencia)

    def detalle(self):
        return (
            f"Transacción: MercadoPago {self.monto} {self.moneda}, "
            f"ref: {self.referencia}, fecha: {self.fecha}"
        )


# --- Fábricas abstractas y concretas --- #
class CobroFabricaAbstracta(ABC):
    """!
    @brief Interfaz abstracta para fábricas de cobros.
    @details
        Define los métodos que cualquier fábrica concreta debe implementar
        para crear los distintos tipos de cobros:
        - efectivo
        - débito
        - crédito
        - MercadoPago
    """
    @abstractmethod
    def crear_pago_efectivo(self, monto, fecha):
        pass

    @abstractmethod
    def crear_pago_debito(self, monto, fecha, tipo, banco, referencia):
        pass

    @abstractmethod
    def crear_pago_credito(self, monto, fecha, tipo, banco, referencia, cuota):
        pass

    @abstractmethod
    def crear_pago_mercadopago(self, monto, fecha, referencia):
        pass


class CobroContadoFabrica(CobroFabricaAbstracta):
    """! Fábrica concreta para cobros al contado (efectivo) """
    def crear_pago_efectivo(self, monto, fecha):
        return CobroEfectivo(monto, fecha)

    def crear_pago_debito(self, *args):
        raise NotImplementedError("Método no válido para pago al contado")

    def crear_pago_credito(self, *args):
        raise NotImplementedError("Método no válido para pago al contado")

    def crear_pago_mercadopago(self, *args):
        raise NotImplementedError("Método no válido para pago al contado")


class CobroElectronicoFabrica(CobroFabricaAbstracta):
    """! Fábrica concreta para cobros electrónicos (tarjeta o MercadoPago) """
    def crear_pago_efectivo(self, *args):
        raise NotImplementedError("Método no válido para pago electrónico")

    def crear_pago_debito(self, monto, fecha, tipo, banco, referencia):
        return CobroDebito(monto, fecha, tipo, banco, referencia)

    def crear_pago_credito(self, monto, fecha, tipo, banco, referencia, cuota):
        return CobroCredito(monto, fecha, tipo, banco, referencia, cuota)

    def crear_pago_mercadopago(self, monto, fecha, referencia):
        return CobroMercadoPago(monto, fecha, referencia)
