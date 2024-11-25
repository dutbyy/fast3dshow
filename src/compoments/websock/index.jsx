import React, { useState, useEffect, useRef } from 'react';

const WebSocketComponent = () => {
    const [message, setMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);

    // 建立 WebSocket 连接
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3002');

        socketRef.current = socket;

        socket.onopen = () => {
            console.log('Connected to WebSocket server');
            setConnected(true);
        };

        socket.onmessage = (event) => {
            const receivedMessage = event.data;
            setMessage(receivedMessage);
            // console.log('Received message:', receivedMessage);
            const units = JSON.parse(receivedMessage)
            // console.log('Received message:', JSON.parse(receivedMessage));
            const custom_event = new CustomEvent(
                "UnitsEvent", 
                {
                    detail : units
                }
            )
            window.dispatchEvent(custom_event)

        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setConnected(false);
        };

        socket.onerror = (error) => {
            // console.error('WebSocket error:', error);
            // console.
        };

        // 清理函数
        return () => {
            socket.close();
        };
    }, []);
    return ;
};

export default WebSocketComponent;