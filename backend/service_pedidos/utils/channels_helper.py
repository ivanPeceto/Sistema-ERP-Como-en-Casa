import logging
from time import sleep
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

def send_channel_message(group_name: str, message_payload: dict, retries: int = 3, delay: float = 1.0):
    """
    @brief Envía un mensaje a un grupo de Channels con política de reintentos
    @param group_name (str): El nombre del grupo al que se propagará el mensaje
    @param message_payload (dict): Contenido del mensaje
    @param retries (int): Número de reintentos
    @param delay (float): Tiempo entre intentos en segundos
    """
    channel_layer= get_channel_layer()

    if not channel_layer:
        logger.error('No se pudo obtener channel_layer...')
        return
    
    for attempt in range(retries):
        try:
            async_to_sync(channel_layer.group_send)(group_name, message_payload)
            logger.info(f"Mensaje enviado correctamente.\n  Grupo: {group_name}\n  Intento número: {attempt+1}")
            return
        except (ConnectionError, TimeoutError) as e:
            logger.warning(
                f"Intento {attempt+1} de {retries} fallido al enviar el mensaje a {group_name}"
                f"Error: {e}. Reintentando en {delay} segundos"
            )

            if attempt < retries -1:
                sleep(delay)
            else:
                logger.error(
                    f"No se pudo enviar el mensaje a {group_name} después de {retries} intentos. "
                    "La operación principal continuará, pero la notificación en tiempo real se perdió."
                )
            return

