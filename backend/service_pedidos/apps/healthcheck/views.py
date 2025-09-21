from django.http import JsonResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from redis.exceptions import ConnectionError, TimeoutError
import asyncio

class HealthCheckView(APIView):
    """!
    @brief Vista verificar el estado del microservicio.
    @details Verifica el estado con la base de datos y el canal de redis.
    """
    permission_classes = []

    def get(self, request):
        try:
            from django.db import connection
            connection.ensure_connection()
        except Exception as e:
            return JsonResponse({'status': 'error', 'db_error': str(e)}, status=503)

        try:
            channel_layer = get_channel_layer()
            async def check_channel_layer():
                await channel_layer.send("health_check_channel", {"type": "health.check"})

            asyncio.run(asyncio.wait_for(check_channel_layer(), timeout=2.0))

        except (ConnectionError, TimeoutError, asyncio.TimeoutError) as e:
            return JsonResponse({'status': 'error', 'channel_layer_error': str(e)}, status=503)
        except Exception as e:
            return JsonResponse({'status': 'error', 'unexpected_error': str(e)}, status=503)

        return JsonResponse({'status': 'ok'})