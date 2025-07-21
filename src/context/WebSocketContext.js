import React, { createContext, useContext, useRef, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const stompClient = useRef(null);
  const onConnectListeners = useRef([]);

  // Permite a los componentes registrar listeners para onConnect
  const addOnConnectListener = useCallback((listener) => {
    onConnectListeners.current.push(listener);
    // Si ya está conectado, llama de inmediato
    if (stompClient.current && stompClient.current.connected) {
      listener();
    }
    return () => {
      onConnectListeners.current = onConnectListeners.current.filter(l => l !== listener);
    };
  }, []);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        onConnectListeners.current.forEach(fn => fn());
      }
    });
    stompClient.current = client;
    client.activate();
    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ stompClient, addOnConnectListener }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
