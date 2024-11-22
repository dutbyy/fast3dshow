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
            console.log('Received message:', JSON.parse(receivedMessage));
        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setConnected(false);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // 清理函数
        return () => {
            socket.close();
        };
    }, []);

    // 发送信号
    const sendMessage = () => {
        // if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        //     const signal = 'Hello, WebSocket!';
        //     socketRef.current.send(signal);
        //     console.log('Sent message:', signal);
        // } else {
        //     console.log('WebSocket is not open yet');
        // }
    };

    return ;
};

export default WebSocketComponent;