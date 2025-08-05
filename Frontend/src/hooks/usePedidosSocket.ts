import { useEffect, useRef } from 'react';
import type { Pedido } from '../types/models';

type MessagePayload = {
    action: 'create' | 'update' | 'delete';
    pedido: Pedido;
};

export const usePedidosSocket = (
    onMessageReceived: (data: MessagePayload) => void
) => {
    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        // La URL debe apuntar al endpoint del microservicio de pedidos a través de Nginx
        // En desarrollo, sería 'ws://localhost:8004/ws/pedidos/' si no usaras Nginx
        // Con Nginx, será 'ws://localhost/api/pedidos/ws/pedidos/' (necesitaremos configurar esto)
        const socketURL = `ws://192.168.1.25/api/pedidos/ws/notifications/`;

        socket.current = new WebSocket(socketURL);

        socket.current.onopen = () => {
            console.log("WebSocket conectado exitosamente.");
        };

        socket.current.onmessage = (event) => {
            const data: MessagePayload = JSON.parse(event.data);
            console.log('Mensaje recibido del WebSocket:', data);
            onMessageReceived(data);
        };

        socket.current.onclose = () => {
            console.log("WebSocket desconectado.");
            // Aquí podrías implementar lógica de reconexión si quisieras
        };

        socket.current.onerror = (error) => {
            console.error("Error en WebSocket:", error);
        };

        // Limpieza al desmontar el componente
        return () => {
            socket.current?.close();
        };
    }, [onMessageReceived]);
};