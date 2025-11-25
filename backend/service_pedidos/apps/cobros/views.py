from rest_framework import status, viewsets
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
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
    """
    ViewSet para la gestión de cobros, incluyendo cobros parciales y actualización automática
    del saldo del pedido.
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
        if self.action == 'destroy':
            permission_classes = [AdminOnly]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [AdminRecepcionista]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = Cobro.objects.all().order_by('-fecha')
        estado = self.request.query_params.get('estado', None)
        if estado and estado.lower() in ['activo', 'cancelado']:
            queryset = queryset.filter(estado=estado.lower())
        return queryset

    def _crear_transaccion(self, tipo, monto, banco=None, referencia=None, cuotas=None):
        """
        Método auxiliar para crear la transacción según tipo de cobro
        utilizando fábricas.
        """
        if tipo == "efectivo":
            fabrica = CobroContadoFabrica()
            return fabrica.crear_pago_efectivo(monto, str(date.today()))
        else:
            fabrica = CobroElectronicoFabrica()
            if tipo == "debito":
                return fabrica.crear_pago_debito(monto, str(date.today()), "Débito", banco, referencia)
            elif tipo == "credito":
                return fabrica.crear_pago_credito(monto, str(date.today()), "Crédito", banco, referencia, cuotas)
            elif tipo == "mercadopago":
                return fabrica.crear_pago_mercadopago(monto, str(date.today()), referencia)
            else:
                return None

    def _aplicar_decoradores(self, transaccion, descuento, recargo):
        """Aplica decoradores de descuento y recargo si corresponde."""
        if descuento > 0:
            transaccion = Descuento(transaccion, descuento)
        if recargo > 0:
            transaccion = Recargo(transaccion, recargo)
        return transaccion

    def _guardar_cobro_y_actualizar_pedido(self, pedido, transaccion, tipo):
        """Guarda el cobro y actualiza automáticamente el estado de pago del pedido."""
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
        pedido.pagado = pedido.saldo_pendiente() == 0
        pedido.save()
        return cobro

    def create(self, request, *args, **kwargs):
        data = request.data
        tipo = data.get('tipo')
        pedido_id = data.get('pedido')
        referencia = data.get('referencia')
        banco = data.get('banco')
        cuotas = data.get('cuotas')
        monto = Decimal(data.get('monto', 0))
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
            return Response({"error": f"El monto supera el saldo pendiente ({saldo})"}, status=400)

        transaccion = self._crear_transaccion(tipo, monto, banco, referencia, cuotas)
        if not transaccion:
            return Response({"error": "Tipo de cobro no válido"}, status=400)

        transaccion = self._aplicar_decoradores(transaccion, descuento, recargo)
        cobro = self._guardar_cobro_y_actualizar_pedido(pedido, transaccion, tipo)

        serializer = CobroSerializer(cobro)
        return Response({"detalle": transaccion.detalle(), "cobro": serializer.data}, status=201)

    def update(self, request, *args, **kwargs):
        cobro = self.get_object()
        if cobro.estado == 'cancelado':
            return Response({"error": "No se puede actualizar un cobro cancelado."}, status=400)

        data = request.data
        tipo = data.get('tipo', cobro.tipo)
        referencia = data.get('referencia', getattr(cobro, 'referencia', None))
        banco = data.get('banco', getattr(cobro, 'banco', None))
        cuotas = data.get('cuotas', getattr(cobro, 'cuotas', None))
        monto = Decimal(data.get('monto', 0))
        descuento = Decimal(data.get('descuento', 0))
        recargo = Decimal(data.get('recargo', 0))

        pedido = cobro.pedido
        saldo = Decimal(pedido.saldo_pendiente()) + Decimal(cobro.monto)

        if monto <= 0:
            return Response({"error": "El monto debe ser mayor a 0"}, status=400)
        if monto > saldo:
            return Response({"error": f"El monto supera el saldo pendiente ({saldo})"}, status=400)

        transaccion = self._crear_transaccion(tipo, monto, banco, referencia, cuotas)
        if not transaccion:
            return Response({"error": "Tipo de cobro no válido"}, status=400)

        transaccion = self._aplicar_decoradores(transaccion, descuento, recargo)

        cobro.tipo = tipo
        cobro.monto = transaccion.monto
        cobro.fecha = transaccion.fecha
        cobro.banco = getattr(transaccion, 'banco', None)
        cobro.referencia = getattr(transaccion, 'referencia', None)
        cobro.cuotas = getattr(transaccion, 'cuota', None)
        cobro.save()

        # Actualizar estado de pago del pedido
        pedido.pagado = pedido.saldo_pendiente() == 0
        pedido.save()

        serializer = CobroSerializer(cobro)
        return Response({"detalle": transaccion.detalle(), "cobro": serializer.data}, status=200)

    def destroy(self, request, *args, **kwargs):
        cobro = self.get_object()
        pedido = cobro.pedido

        if cobro.estado == 'cancelado':
            return Response({"error": "Este cobro ya está cancelado."}, status=400)

        if Decimal(pedido.saldo_pendiente()) + Decimal(cobro.monto) < 0:
            return Response({"error": "No se puede eliminar este cobro, afectaría el saldo del pedido."}, status=400)

        cobro.estado = "cancelado"
        cobro.save()

        # Actualizar estado de pago del pedido
        pedido.pagado = pedido.saldo_pendiente() == 0
        pedido.save()

        return Response({"mensaje": "Cobro cancelado correctamente"}, status=204)

    @action(detail=False, methods=['get'], url_path='listar/(?P<pedido_id>[^/.]+)')
    def por_pedido(self, request, pedido_id=None):
        """Devuelve todos los cobros de un pedido específico"""
        cobros = Cobro.objects.filter(pedido_id=pedido_id, estado='activo').order_by('-fecha')
        serializer = self.get_serializer(cobros, many=True)
        return Response(serializer.data)