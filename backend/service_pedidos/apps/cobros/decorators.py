from functools import wraps

class CobroDecorator:
    """!
    @brief Clase base para decoradores de cobro.
    @details
        Permite extender o modificar el comportamiento de un objeto de tipo Cobro
        sin alterar su implementación original. Funciona como envoltorio (wrapper)
        y delega los atributos y métodos al objeto cobro original.
    @attributes
        _cobro : Cobro
            Objeto de cobro que se va a decorar.
    @methods
        detalle() -> str
            Retorna la descripción del cobro, puede ser extendida por decoradores concretos.
        monto -> Decimal
            Propiedad que retorna el monto actual del cobro.
        id -> int
            Propiedad que retorna el ID del cobro.
        fecha -> date
            Propiedad que retorna la fecha del cobro.
        moneda -> str
            Propiedad que retorna la moneda del cobro.
    """
    def __init__(self, cobro):
        self._cobro = cobro

    def detalle(self):
        """Retorna el detalle del cobro. Puede ser extendido por subclases."""
        return self._cobro.detalle()

    @property
    def monto(self):
        return self._cobro.monto

    @property
    def id(self):
        return self._cobro.id

    @property
    def fecha(self):
        return self._cobro.fecha

    @property
    def moneda(self):
        return self._cobro.moneda


class Descuento(CobroDecorator):
    """!
    @brief Decorador que aplica un descuento porcentual sobre el monto de un cobro.
    @details
        Modifica directamente el monto del cobro aplicando un porcentaje de descuento.
        La descripción del cobro (`detalle()`) se extiende para indicar el descuento aplicado
        y el monto final.
    @attributes
        porcentaje : float
            Porcentaje de descuento a aplicar.
    @methods
        _aplicar_descuento()
            Calcula y aplica el descuento sobre el monto del cobro.
        detalle() -> str
            Retorna el detalle del cobro con el descuento aplicado.
    """
    def __init__(self, cobro, porcentaje):
        super().__init__(cobro)
        self.porcentaje = porcentaje
        self._aplicar_descuento()

    def _aplicar_descuento(self):
        """Calcula y aplica el descuento sobre el monto del cobro."""
        descuento = (self._cobro.monto * self.porcentaje) / 100
        self._cobro.monto -= descuento

    def detalle(self):
        return (
            self._cobro.detalle()
            + f"Descuento aplicado: {self.porcentaje}%.\nMonto final: {self._cobro.monto}\n"
        )


class Recargo(CobroDecorator):
    """!
    @brief Decorador que aplica un recargo porcentual sobre el monto de un cobro.
    @details
        Modifica directamente el monto del cobro aplicando un porcentaje de recargo.
        La descripción del cobro (`detalle()`) se extiende para indicar el recargo aplicado
        y el monto final.
    @attributes
        porcentaje : float
            Porcentaje de recargo a aplicar.
    @methods
        _aplicar_recargo()
            Calcula y aplica el recargo sobre el monto del cobro.
        detalle() -> str
            Retorna el detalle del cobro con el recargo aplicado.
    """
    def __init__(self, cobro, porcentaje):
        super().__init__(cobro)
        self.porcentaje = porcentaje
        self._aplicar_recargo()

    def _aplicar_recargo(self):
        """Calcula y aplica el recargo sobre el monto del cobro."""
        recargo = (self._cobro.monto * self.porcentaje) / 100
        self._cobro.monto += recargo

    def detalle(self):
        return (
            self._cobro.detalle()
            + f"Recargo aplicado: {self.porcentaje}%.\nMonto final: {self._cobro.monto}\n"
        )
