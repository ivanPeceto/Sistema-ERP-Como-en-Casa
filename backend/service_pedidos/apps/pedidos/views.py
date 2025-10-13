from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsSuperUser
from rest_framework.response import Response
from rest_framework import status
from apps.pedidos.models import Pedido
from apps.pedidos.serializer import PedidoSerializer
from datetime import datetime, time
from django.utils import timezone
import requests
from decouple import config 
from channels.layers import get_channel_layer
from utils.channels_helper import send_channel_message

class PedidoListView(ListAPIView):
    """!
    @brief Vista para listar y buscar pedidos.
    @details
        Hereda de ListAPIView para facilitar la visualización de listas de pedidos.
        Permite filtrar pedidos por fecha (obligatorio) y numero_pedido (opcional),
        proporcionados como parámetros en la query string de la URL.
        Requiere que el usuario esté autenticado.
        No requiere privilegios de superusuario.
    @property serializer_class: Especifica el serializador a usar (PedidoSerializer).
    @property permission_classes: Define los permisos requeridos.
    """
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """!
        @brief Define el queryset base para la busqueda de pedidos.
        @details
            Este metodo se sobrescribe para filtrar los pedidos según los parámetros
            'fecha' y 'numero_pedido' de la solicitud GET.
            El parámetro 'fecha' es obligatorio y debe estar en formato 'YYYY-MM-DD'.
            El parámetro 'numero_pedido' es opcional.
        @return: Un queryset de objetos Pedido filtrados, o un queryset vacío.
        """
        fecha = self.request.query_params.get('fecha')
        numero_pedido = self.request.query_params.get('numero')

        if not fecha and not numero_pedido:
            return Response({'detail':'Falta proporcionar fecha o número de pedido.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
            start_of_day = timezone.make_aware(datetime.combine(fecha_obj, time.min))
            end_of_day = timezone.make_aware(datetime.combine(fecha_obj, time.max))
        except:
            return Pedido.objects.none()
        
        queryset = Pedido.objects.filter(fecha_pedido__range=(start_of_day, end_of_day))

        if numero_pedido:
            queryset = queryset.filter(numero_pedido=numero_pedido)     
        return queryset
        
class CrearPedidoView(APIView):
    """!
    @brief Vista para la creación de nuevos pedidos.
    @details
        Permite crear un nuevo pedido, incluyendo sus productos asociados, mediante
        una solicitud POST.
        Requiere que el usuario esté autenticado.
        No requiere privilegios de superusuario.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para crear un nuevo pedido.
        @details
            Valida los datos del pedido (incluyendo la lista de productos)
            proporcionados en request.data utilizando PedidoSerializer.
            Si son válidos, guarda el nuevo pedido y sus productos asociados.

        @param request: Objeto de la solicitud HTTP.
        @return: 
            - Éxito: Devuelve los datos del pedido creado y un estado HTTP 200 OK.
            - Fallo: Devuelve los errores de validación y un estado HTTP 400 BAD REQUEST.
        """
        pedidoSerializer = PedidoSerializer(data=request.data)

        if pedidoSerializer.is_valid():
            pedido = pedidoSerializer.save()

            message_payload = {
                'type': 'send.notification',
                'message': {
                    'source':'pedidos',
                    'action': 'create',
                    'pedido': PedidoSerializer(pedido).data
                }
            }
            send_channel_message('app_notifications', message_payload, 10, 0.5)

            return Response(PedidoSerializer(pedido).data, status=status.HTTP_200_OK)
        else:
            return Response(pedidoSerializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EliminarPedidoView(APIView):
    """!
    @brief Vista para la eliminación de pedidos.
    @details
        Permite eliminar un pedido específico mediante una solicitud POST.
        La identificación del pedido a eliminar se realiza mediante una combinación
        de id (opcional), fecha (obligatorio) y numero_pedido (obligatorio).
        Requiere que el usuario esté autenticado y sea superusuario.
    """
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para eliminar un pedido.
        @details
            Valida la presencia de fecha y numero de pedido en los
            query params. Valida el formato de fecha.
            Busca el pedido usando 'id' (opcional), 'fecha_pedido' y 'numero_pedido' (obligatorios).
            Si se encuentra, lo elimina.
            
        @param request: Objeto de la solicitud HTTP.
        @return:
            - Éxito: Mensaje de éxito y HTTP 200 OK.
            - Error de parámetros o formato: HTTP 400 BAD REQUEST.
            - Pedido no encontrado: HTTP 404 NOT FOUND.
        """
        fecha = request.query_params.get('fecha')
        numero_pedido = request.query_params.get('numero')
        id_pedido = request.query_params.get('id')

        if not fecha:
            return Response({'detail':'Falta proporcionar fecha de pedido a eliminar'}, status=status.HTTP_400_BAD_REQUEST)
        if not numero_pedido:
            return Response({'detail':'Falta proporcionar número de pedido a eliminar'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
            start_of_day = timezone.make_aware(datetime.combine(fecha_obj, time.min))
            end_of_day = timezone.make_aware(datetime.combine(fecha_obj, time.max))
        except:
            return Response({'detail':'Formato de fecha inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
        try:
            if not id_pedido:
                pedido = Pedido.objects.get(fecha_pedido__range=(start_of_day, end_of_day), numero_pedido=numero_pedido)
            else:
                pedido = Pedido.objects.get(id=id_pedido, fecha_pedido__range=(start_of_day, end_of_day), numero_pedido=numero_pedido)            
            pedido_id = pedido.id
            pedido.delete()

            message_payload = {
                'type': 'send.notification',
                'message': {
                    'source':'pedidos',
                    'action': 'delete',
                    'id': pedido_id,
                }
            }
            send_channel_message('app_notifications', message_payload, 10, 0.5)

            return Response({'detail':'Pedido eliminado exitosamente'}, status=status.HTTP_200_OK)
        except:
            return Response({'detail':'Pedido a eliminar no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
class EditarPedidoView(APIView):
    """!
    @brief Vista para la edición de pedidos existentes.
    @details
        Permite actualizar un pedido, incluyendo sus productos, mediante una solicitud PUT.
        La identificación del pedido se realiza usando 'id' (opcional), 'fecha' y 'numero_pedido' (obligatorios).
        Requiere que el usuario esté autenticado.
        No requiere permisos de superusuario.
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """!
        @brief Maneja las solicitudes PUT para editar un pedido.
        @details
            Valida parámetros y formato de fecha como en EliminarPedidoView.
            Busca el pedido. Si se encuentra, lo actualiza con los datos de request.data usando PedidoSerializer.
        @param request (rest_framework.request.Request): Objeto de la solicitud HTTP.
        @return:
            - Éxito en actualización: Mensaje de éxito y HTTP 200 OK.
            - Datos inválidos (del serializer): Errores del serializador y HTTP 400 BAD REQUEST.
            - Error de parámetros o formato de fecha: HTTP 400 BAD REQUEST.
            - Pedido no encontrado: HTTP 404 NOT FOUND
        """

        fecha = request.query_params.get('fecha')
        numero_pedido = request.query_params.get('numero')
        id_pedido = request.query_params.get('id')

        if not fecha:
            return Response({'detail':'Falta proporcionar fecha de pedido a editar'}, status=status.HTTP_400_BAD_REQUEST)
        if not numero_pedido:
            return Response({'detail':'Falta proporcionar número de pedido a editar'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
            start_of_day = timezone.make_aware(datetime.combine(fecha_obj, time.min))
            end_of_day = timezone.make_aware(datetime.combine(fecha_obj, time.max))
        except:
            return Response({'detail':'Formato de fecha inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
        try:
            if not id_pedido:
                pedido = Pedido.objects.get(fecha_pedido__range=(start_of_day, end_of_day), numero_pedido=numero_pedido)
            else:
                pedido = Pedido.objects.get(id=id_pedido, fecha_pedido__range=(start_of_day, end_of_day), numero_pedido=numero_pedido)      
            pedidoSerializer = PedidoSerializer(pedido, data=request.data)

            if(pedidoSerializer.is_valid()):
                pedido_actualizado = pedidoSerializer.save()

                message_payload = {
                    'type': 'send.notification', 
                    'message': {
                        'source': 'pedidos', 
                        'action': 'update',
                        'pedido': PedidoSerializer(pedido_actualizado).data
                    }
                }
                send_channel_message('app_notifications', message_payload, 10, 0.5)
                return Response({'detail':'Pedido editado exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response(pedidoSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'detail':'Pedido a editar no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
class ImprimirPedidoView(APIView):
    permission_classes = [IsAuthenticated]

    def imprimirComanda(self, pedido):
        try:
            pedidoSerialized = PedidoSerializer(pedido).data
            ip = config('IP_IMPRESORA')
            route = f"http://{ip}:5000/imprimir_comanda"
            r = requests.post(route, json=pedidoSerialized)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.RequestException as e:
            return {'detail': f'Error al intentar enviar la solicitud a la impresora: {e}'}
        except Exception as e:
            return {'detail': f'Fallo inesperado al imprimir comanda: {e}'}


    def post(self, request):

        fecha = request.query_params.get('fecha')
        numero_pedido = request.query_params.get('numero')
        id_pedido = request.query_params.get('id')

        if not fecha:
            return Response({'detail':'Falta proporcionar fecha de pedido a editar'}, status=status.HTTP_400_BAD_REQUEST)
        if not numero_pedido:
            return Response({'detail':'Falta proporcionar número de pedido a editar'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
            start_of_day = timezone.make_aware(datetime.combine(fecha_obj, time.min))
            end_of_day = timezone.make_aware(datetime.combine(fecha_obj, time.max))
        except ValueError:
            return Response({'detail':'Formato de fecha inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if not id_pedido:
                pedido = Pedido.objects.get(fecha_pedido__range=(start_of_day, end_of_day), numero_pedido=numero_pedido)
            else:
                pedido = Pedido.objects.get(id=id_pedido, fecha_pedido__range=(start_of_day, end_of_day), numero_pedido=numero_pedido)

            resp = self.imprimirComanda(pedido)
            return Response(resp, status=status.HTTP_200_OK)
        except Pedido.DoesNotExist:
            return Response({'detail':'Pedido a imprimir no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': f'Error interno al procesar la solicitud de impresión: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)