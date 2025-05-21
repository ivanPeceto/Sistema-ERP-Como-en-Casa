import requests

def get_precio_unitario(id_producto):
    try:
        response = requests.get(f'http://productos:8003/producto/{id_producto}')
        if response.status_code == 200:
            return response.json().get('precio_unitario')
    except:
        return None