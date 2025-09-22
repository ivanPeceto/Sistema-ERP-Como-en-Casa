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
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const socketURL = `ws://${API_BASE_URL.slice(7)}/api/pedidos/ws/notifications/`;

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
            // Implementar logica de reconexion aqui:
        };

        socket.current.onerror = (error) => {
            console.error("Error en WebSocket:", error);
        };

        return () => {
            socket.current?.close();
        };
    }, [onMessageReceived]);
};