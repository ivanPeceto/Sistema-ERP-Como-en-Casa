from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.pedidos.models import Pedido
from apps.pedidos.serializer import PedidoSerializer
from datetime import datetime

class PedidoListView(ListAPIView):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        fecha = self.request.query_params.get('fecha')
        numero_pedido = self.request.query_params.get('numero_pedido')

        ##Devuelve un pedido vacío si la fecha es invalida
        if not fecha:
            return Pedido.objects.none()

        try:
            fecha_sanitized = datetime.strptime(fecha, "%Y-%m-%d").date()
        except:
            return Pedido.objects.none()
        
        queryset = Pedido.objects.filter(fecha_pedido=fecha_sanitized)
        if numero_pedido:
            queryset = queryset.filter(numero_pedido=numero_pedido)     
        return queryset
        
class CrearPedidoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pedidoSerializer = PedidoSerializer(data=request.data)

        if pedidoSerializer.is_valid():
            pedido = pedidoSerializer.save()
            return Response(PedidoSerializer(pedido).data, status=status.HTTP_200_OK)
        else:
            return Response(pedidoSerializer.errors, status=status.HTTP_400_BAD_REQUEST)

        