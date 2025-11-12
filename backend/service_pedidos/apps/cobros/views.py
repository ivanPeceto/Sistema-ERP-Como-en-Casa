from rest_framework import status, viewsets
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from datetime import date
from decimal import Decimal

from .models import Cobro
from .serializer import CobroSerializer
from .factories import CobroElectronicoFabrica, CobroContadoFabrica
from .decorators import Descuento, Recargo
from apps.pedidos.models import Pedido

from rest_framework.permissions import IsAuthenticated
from utils.permissions import AdminOnly, AdminRecepcionista


class CobroViewSet(viewsets.ModelViewSet):
    """!
    @brief ViewSet para la gestión de cobros.
    @details
        Esta clase implementa las operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
        sobre el modelo `Cobro`, utilizando las herramientas de Django REST Framework.

        Además de las operaciones básicas, incorpora:
        - **Control de permisos por rol** mediante `AdminOnly` y `AdminRecepcionista`.
        - **Filtros, búsqueda y ordenación** con `DjangoFilterBackend`.
        - **Aplicación de fábricas y decoradores** para construir y modificar cobros
          según el tipo de transacción (`efectivo`, `debito`, `credito`, `mercadopago`).
        - **Validaciones de negocio** para garantizar la coherencia de los montos
          y el estado de los pedidos asociados.

        Los cobros se crean utilizando el patrón *Factory* y pueden ser modificados
        dinámicamente con los decoradores `Descuento` y `Recargo`.

    @example
        # Ejemplo de uso en rutas
        from rest_framework.routers import DefaultRouter
        from apps.cobros.views import CobroViewSet

        router = DefaultRouter()
        router.register(r'cobros', CobroViewSet, basename='cobros')
    """

    queryset = Cobro.objects.all().order_by('-fecha')
    serializer_class = CobroSerializer
    permission_classes = [IsAuthenticated]

    # Filtros y búsqueda avanzada
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pedido', 'tipo', 'estado']
    search_fields = ['banco', 'referencia']
    ordering_fields = ['fecha', 'monto']

    def get_permissions(self):
        """!
        @brief Asigna permisos dinámicos según la acción ejecutada.
        @details
            - `destroy`: Solo los usuarios con rol **Administrador**.
            - `create`, `update`, `partial_update`: **Administrador** o **Recepcionista**.
            - Resto de acciones (`list`, `retrieve`): Cualquier usuario autenticado.
        @return list: Lista de instancias de permisos aplicables.
        """
        if self.action == 'destroy':
            permission_classes = [AdminOnly]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [AdminRecepcionista]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """!
        @brief Obtiene los cobros filtrados por estado.
        @details
            Permite filtrar el listado de cobros según el parámetro de query `estado`:
            - `activo`: Retorna solo cobros activos.
            - `cancelado`: Retorna solo cobros cancelados.
            - `todos`: Retorna todos los cobros sin filtro adicional.
        @return QuerySet: Lista de cobros filtrados.
        """
        queryset = Cobro.objects.all().order_by('-fecha')
        estado = self.request.query_params.get('estado', None)
        
        if estado and estado.lower() in ['activo', 'cancelado']:
            queryset = queryset.filter(estado=estado.lower())

        return queryset

    def create(self, request, *args, **kwargs):
        """!
        @brief Crea un nuevo cobro utilizando una fábrica y decoradores.
        @details
            Este método maneja la creación de cobros de distintos tipos:
            - `efectivo`
            - `debito`
            - `credito`
            - `mercadopago`

            La lógica de creación se delega a las fábricas:
            - `CobroContadoFabrica`
            - `CobroElectronicoFabrica`

            Además, se aplican decoradores para:
            - `Descuento`: Reducir el monto total.
            - `Recargo`: Incrementar el monto total.

            Se realizan validaciones de negocio para asegurar que:
            - El monto sea mayor a 0.
            - No supere el saldo pendiente del pedido asociado.

        @param request: Objeto de la solicitud HTTP con los datos del cobro.
        @return Response: Contiene el detalle de la transacción y el cobro creado.
        """
        data = request.data

        tipo = data.get('tipo')
        pedido_id = data.get('pedido')
        referencia = data.get('referencia')
        banco = data.get('banco')
        cuotas = data.get('cuotas')
        monto = Decimal(request.data.get('monto', 0))
        descuento = Decimal(data.get('descuento', 0))
        recargo = Decimal(data.get('recargo', 0))

        try:
            pedido = Pedido.objects.get(pk=pedido_id)
        except Pedido.DoesNotExist:
            return Response({"error": "Pedido no encontrado"}, status=404)

        saldo = pedido.saldo_pendiente()

        if monto <= 0:
            return Response({"error": "El monto debe ser mayor a 0"}, status=400)

        if monto > saldo:
            return Response({
                "error": f"El monto supera el saldo pendiente ({saldo})"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Crear la transacción con la fábrica correspondiente
        if tipo == "efectivo":
            fabrica = CobroContadoFabrica()
            transaccion = fabrica.crear_pago_efectivo(monto, str(date.today()))
        else:
            fabrica = CobroElectronicoFabrica()
            if tipo == "debito":
                transaccion = fabrica.crear_pago_debito(monto, str(date.today()), "Débito", banco, referencia)
            elif tipo == "credito":
                transaccion = fabrica.crear_pago_credito(monto, str(date.today()), "Crédito", banco, referencia, cuotas)
            elif tipo == "mercadopago":
                transaccion = fabrica.crear_pago_mercadopago(monto, str(date.today()), referencia)
            else:
                return Response({"error": "Tipo de cobro no válido"}, status=400)

        # Aplicar decoradores si corresponde
        if descuento > 0:
            transaccion = Descuento(transaccion, descuento)
        if recargo > 0:
            transaccion = Recargo(transaccion, recargo)

        # Guardar cobro en la base de datos
        cobro = Cobro.objects.create(
            pedido=pedido,
            tipo=tipo,
            monto=transaccion.monto,
            fecha=transaccion.fecha,
            banco=getattr(transaccion, 'banco', None),
            referencia=getattr(transaccion, 'referencia', None),
            cuotas=getattr(transaccion, 'cuota', None),
            estado='activo'
        )

        serializer = CobroSerializer(cobro)
        return Response({
            "detalle": transaccion.detalle(),
            "cobro": serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """!
        @brief Actualiza un cobro existente.
        @details
            Permite modificar un cobro ya registrado aplicando la misma
            lógica de fábricas y decoradores usada en `create()`.

            - Si el cobro está **cancelado**, no puede modificarse.
            - Valida nuevamente el monto frente al saldo del pedido.
            - Aplica descuentos y recargos según corresponda.

        @param request: Objeto HTTP con los nuevos datos del cobro.
        @return Response: Detalle actualizado del cobro y transacción.
        """
        cobro = self.get_object()

        if cobro.estado == 'cancelado':
            return Response(
                {"error": "No se puede actualizar un cobro cancelado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = request.data

        tipo = data.get('tipo', cobro.tipo)
        referencia = data.get('referencia', getattr(cobro, 'referencia', None))
        banco = data.get('banco', getattr(cobro, 'banco', None))
        cuotas = data.get('cuotas', getattr(cobro, 'cuotas', None))
        monto = Decimal(request.data.get('monto', 0))
        descuento = Decimal(data.get('descuento', 0))
        recargo = Decimal(data.get('recargo', 0))

        pedido = cobro.pedido
        saldo = Decimal(pedido.saldo_pendiente()) + Decimal(cobro.monto)

        if monto <= 0:
            return Response({"error": "El monto debe ser mayor a 0"}, status=400)

        if monto > saldo:
            return Response({
                "error": f"El monto supera el saldo pendiente ({saldo})"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Crear nueva transacción
        if tipo == "efectivo":
            fabrica = CobroContadoFabrica()
            transaccion = fabrica.crear_pago_efectivo(monto, str(date.today()))
        else:
            fabrica = CobroElectronicoFabrica()
            if tipo == "debito":
                transaccion = fabrica.crear_pago_debito(monto, str(date.today()), "Débito", banco, referencia)
            elif tipo == "credito":
                transaccion = fabrica.crear_pago_credito(monto, str(date.today()), "Crédito", banco, referencia, cuotas)
            elif tipo == "mercadopago":
                transaccion = fabrica.crear_pago_mercadopago(monto, str(date.today()), referencia)
            else:
                return Response({"error": "Tipo de cobro no válido"}, status=400)

        if descuento > 0:
            transaccion = Descuento(transaccion, descuento)
        if recargo > 0:
            transaccion = Recargo(transaccion, recargo)

        # Actualizar datos del cobro
        cobro.tipo = tipo
        cobro.monto = transaccion.monto
        cobro.fecha = transaccion.fecha
        cobro.banco = getattr(transaccion, 'banco', None)
        cobro.referencia = getattr(transaccion, 'referencia', None)
        cobro.cuotas = getattr(transaccion, 'cuota', None)
        cobro.save()

        serializer = CobroSerializer(cobro)
        return Response({
            "detalle": transaccion.detalle(),
            "cobro": serializer.data
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """!
        @brief Cancela (no elimina físicamente) un cobro.
        @details
            En lugar de borrar el registro, este método marca el cobro como `cancelado`.
            Esto evita inconsistencias en el historial de pagos y mantiene la trazabilidad.

            Validaciones:
            - Si el cobro ya está cancelado, se rechaza la operación.
            - Se evita cancelar un cobro que afecte negativamente el saldo del pedido.

        @param request: Objeto de solicitud HTTP.
        @return Response: Mensaje de confirmación o error.
        """
        cobro = self.get_object()
        pedido = cobro.pedido

        if cobro.estado == 'cancelado':
            return Response(
                {"error": "Este cobro ya está cancelado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Decimal(pedido.saldo_pendiente()) + Decimal(cobro.monto) < 0:
            return Response({
                "error": "No se puede eliminar este cobro, afectaría el saldo del pedido."
            }, status=status.HTTP_400_BAD_REQUEST)

        cobro.estado = "cancelado"
        cobro.save()

        return Response({"mensaje": "Cobro cancelado correctamente"}, status=status.HTTP_204_NO_CONTENT)
