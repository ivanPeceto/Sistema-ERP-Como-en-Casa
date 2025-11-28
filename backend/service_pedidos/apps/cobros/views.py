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

from utils.channels_helper import send_channel_message
from apps.pedidos.serializer import PedidoSerializer

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

    def _procesar_decoradores_y_totales(self, transaccion, porcentaje_descuento, porcentaje_recargo):
        """
        Aplica los decoradores y calcula los montos monetarios absolutos 
        de los descuentos y recargos para guardarlos en BD.
        """
        monto_inicial = transaccion.monto
        
        # Aplicar decoradores
        if porcentaje_descuento > 0:
            transaccion = Descuento(transaccion, porcentaje_descuento)
        if porcentaje_recargo > 0:
            transaccion = Recargo(transaccion, porcentaje_recargo)
            
        monto_final = transaccion.monto

        # Calcular valores absolutos 
        val_descuento = Decimal(0)
        val_recargo = Decimal(0)

        if porcentaje_descuento > 0:
            # Cuánto bajó el precio:
            val_descuento = monto_inicial - monto_final
            #if val_descuento < 0: val_descuento = 0 

        if porcentaje_recargo > 0:
            # Cuánto subió el precio:
            val_recargo = monto_final - monto_inicial
            #if val_recargo < 0: val_recargo = 0

        return transaccion, val_descuento, val_recargo

    def create(self, request, *args, **kwargs):
        data = request.data
        tipo = data.get('tipo')
        pedido_id = data.get('pedido')
        
        # Datos opcionales
        referencia = data.get('referencia')
        banco = data.get('banco')
        cuotas = data.get('cuotas')
        
        # Valores numéricos
        monto_base = Decimal(data.get('monto', 0))
        pct_descuento = Decimal(data.get('descuento', 0)) # Porcentaje
        pct_recargo = Decimal(data.get('recargo', 0))     # Porcentaje

        try:
            pedido = Pedido.objects.get(pk=pedido_id)
        except Pedido.DoesNotExist:
            return Response({"error": "Pedido no encontrado"}, status=404)

        if monto_base <= 0:
            return Response({"error": "El monto debe ser mayor a 0"}, status=400)
            
        # Transacción Base
        transaccion = self._crear_transaccion(tipo, monto_base, banco, referencia, cuotas)
        if not transaccion:
            return Response({"error": "Tipo de cobro no válido"}, status=400)

        # Aplica decoradores 
        transaccion, val_desc, val_rec = self._procesar_decoradores_y_totales(transaccion, pct_descuento, pct_recargo)

        # Guarda cobro
        cobro = Cobro.objects.create(
            pedido=pedido,
            tipo=tipo,
            monto=transaccion.monto, # Monto final (Neto percibido)
            descuento=val_desc,      # Monto descontado (Crédito)
            recargo=val_rec,         # Monto recargado (No Crédito)
            fecha=transaccion.fecha,
            banco=getattr(transaccion, 'banco', None),
            referencia=getattr(transaccion, 'referencia', None),
            cuotas=getattr(transaccion, 'cuota', None),
            estado='activo'
        )
        
        # Actualizar Pedido (Dispara recálculo de 'pagado')
        pedido.save()
        message_payload = {
            'type': 'send.notification', 
            'message': {
                'source': 'pedidos', 
                'action': 'update',
                'pedido': PedidoSerializer(pedido).data
            }
        }
        send_channel_message('app_notifications', message_payload, 10, 0.5)

        serializer = CobroSerializer(cobro)
        return Response({
            "detalle": transaccion.detalle(), 
            "cobro": serializer.data,
            "saldo_restante": pedido.saldo_pendiente()
        }, status=201)

    def update(self, request, *args, **kwargs):
        cobro = self.get_object()
        if cobro.estado == 'cancelado':
            return Response({"error": "No se puede actualizar un cobro cancelado."}, status=400)

        data = request.data
        
        # Recuperar datos actuales o nuevos
        tipo = data.get('tipo', cobro.tipo)
        monto_base = Decimal(data.get('monto', 0)) # El usuario edita el monto base
        pct_descuento = Decimal(data.get('descuento', 0))
        pct_recargo = Decimal(data.get('recargo', 0))

        if monto_base <= 0:
            return Response({"error": "El monto debe ser mayor a 0"}, status=400)

        # Reconstruir transacción
        transaccion = self._crear_transaccion(
            tipo, 
            monto_base, 
            data.get('banco', cobro.banco), 
            data.get('referencia', cobro.referencia), 
            data.get('cuotas', cobro.cuotas)
        )
        if not transaccion:
            return Response({"error": "Tipo de cobro no válido"}, status=400)

        # Recalcular
        transaccion, val_desc, val_rec = self._procesar_decoradores_y_totales(transaccion, pct_descuento, pct_recargo)

        # Actualizar campos
        cobro.tipo = tipo
        cobro.monto = transaccion.monto
        cobro.descuento = val_desc
        cobro.recargo = val_rec
        cobro.fecha = transaccion.fecha
        cobro.banco = getattr(transaccion, 'banco', None)
        cobro.referencia = getattr(transaccion, 'referencia', None)
        cobro.cuotas = getattr(transaccion, 'cuota', None)
        cobro.save()

        cobro.pedido.save() # Actualizar estado del pedido
        message_payload = {
            'type': 'send.notification', 
            'message': {
                'source': 'pedidos', 
                'action': 'update',
                'pedido': PedidoSerializer(cobro.pedido).data
            }
        }
        send_channel_message('app_notifications', message_payload, 10, 0.5)

        serializer = CobroSerializer(cobro)
        return Response({
            "detalle": transaccion.detalle(), 
            "cobro": serializer.data,
            "saldo_restante": cobro.pedido.saldo_pendiente()
        }, status=200)

    def destroy(self, request, *args, **kwargs):
        cobro = self.get_object()
        
        if cobro.estado == 'cancelado':
            return Response({"error": "Este cobro ya está cancelado."}, status=400)

        # Eliminamos la restricción de saldo negativo al borrar. 
        # Si borras un pago, la deuda simplemente aumenta.
        
        cobro.estado = "cancelado"
        cobro.save()

        cobro.pedido.save() # Recalcular estado pagado
        message_payload = {
            'type': 'send.notification', 
            'message': {
                'source': 'pedidos', 
                'action': 'update',
                'pedido': PedidoSerializer(cobro.pedido).data
            }
        }
        send_channel_message('app_notifications', message_payload, 10, 0.5)
        
        return Response({"mensaje": "Cobro cancelado correctamente"}, status=204)

    @action(detail=False, methods=['get'], url_path='listar/(?P<pedido_id>[^/.]+)')
    def por_pedido(self, request, pedido_id=None):
        """Devuelve todos los cobros de un pedido específico"""
        cobros = Cobro.objects.filter(pedido_id=pedido_id, estado='activo').order_by('-fecha')
        serializer = self.get_serializer(cobros, many=True)
        return Response(serializer.data)