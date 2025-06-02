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
            return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)
        else:
            return Response(pedidoSerializer.errors, status=status.HTTP_400_BAD_REQUEST)


##Añadir busqueda por ID directo como en el metodo editar
class EliminarPedidoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        fecha = request.query_params.get('fecha')
        numero_pedido = request.query_params.get('numero_pedido')

        if not fecha:
            return Response({'detail':'Falta proporcionar fecha de pedido a eliminar'}, status=status.HTTP_400_BAD_REQUEST)
        if not numero_pedido:
            return Response({'detail':'Falta proporcionar número de pedido a eliminar'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fecha_sanitized = datetime.strptime(fecha, "%Y-%m-%d").date()
        except:
            return Response({'detail':'Formato de fecha inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
        try:
            pedido = Pedido.objects.get(fecha_pedido=fecha_sanitized, numero_pedido=numero_pedido)
            pedido.delete()
            return Response({'detail':'Pedido eliminado exitosamente'}, status=status.HTTP_200_OK)
        except:
            return Response({'detail':'Pedido a eliminar no encontrado'}, status=status.HTTP_400_BAD_REQUEST)
        
class EditarPedidoView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        fecha = request.query_params.get('fecha')
        numero_pedido = request.query_params.get('numero')
        id_pedido = request.query_params.get('id')

        if not fecha:
            return Response({'detail':'Falta proporcionar fecha de pedido a editar'}, status=status.HTTP_400_BAD_REQUEST)
        if not numero_pedido:
            return Response({'detail':'Falta proporcionar número de pedido a editar'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fecha_sanitized = datetime.strptime(fecha, "%Y-%m-%d").date()
        except:
            return Response({'detail':'Formato de fecha inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        #optimizar esto
        #falta editar productos
        if not id_pedido: 
            try:
                pedido = Pedido.objects.get(fecha_pedido=fecha_sanitized, numero_pedido=numero_pedido)
                pedidoSerializer = PedidoSerializer(pedido, data=request.data)
                if(pedidoSerializer.is_valid()):
                    pedidoSerializer.save()
                    return Response({'detail':'Pedido editado exitosamente'}, status=status.HTTP_200_OK)
                else:
                    return Response(pedidoSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except:
                return Response({'detail':'Pedido a editar no encontrado'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                pedido = Pedido.objects.get(id=id_pedido, fecha_pedido=fecha_sanitized, numero_pedido=numero_pedido)
                pedidoSerializer = PedidoSerializer(pedido, data=request.data)
                if(pedidoSerializer.is_valid()):
                    pedidoSerializer.save()
                    return Response({'detail':'Pedido editado exitosamente'}, status=status.HTTP_200_OK)
                else:
                    return Response(pedidoSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except:
                return Response({'detail':'Pedido a editar no encontrado'}, status=status.HTTP_400_BAD_REQUEST)
        