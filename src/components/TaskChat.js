import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

const API_BASE = 'http://localhost:8080/api';

const TaskChat = ({ taskId, userId, token, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { stompClient, addOnConnectListener } = useWebSocket();
  const chatBottomRef = useRef(null);

  // Cargar historial de mensajes al abrir el chat
  useEffect(() => {
    if (!taskId || !token) return;
    fetch(`${API_BASE}/messages/task/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('No autorizado');
        return res.json();
      })
      .then(data => {
        console.log('Mensajes recibidos:', data);
        setMessages(data);
      })
      .catch(() => setMessages([]));
  }, [taskId, token]);

  useEffect(() => {
    if (!taskId || !stompClient?.current) return;
    let subscription;
    const subscribe = () => {
      if (stompClient.current.connected) {
        subscription = stompClient.current.subscribe(`/topic/task-chat.${taskId}`, (message) => {
          const msg = JSON.parse(message.body);
          setMessages(prev => [...prev, msg]);
        });
      }
    };
    let removeListener;
    if (stompClient.current.connected) {
      subscribe();
    } else {
      removeListener = addOnConnectListener(subscribe);
    }
    return () => {
      if (subscription) subscription.unsubscribe();
      if (removeListener) removeListener();
    };
  }, [taskId, stompClient, addOnConnectListener]);

  useEffect(() => {
    // Scroll al último mensaje
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !stompClient?.current?.connected) return;
    const msg = {
      taskId,
      userId,
      content: input,
      timestamp: new Date().toISOString()
    };
    stompClient.current.publish({
      destination: '/app/task/chat',
      body: JSON.stringify(msg)
    });
    setInput('');
  };

  return (
    <div style={{ width: 320, borderLeft: '1px solid #ddd', height: '100vh', position: 'fixed', right: 0, top: 0, background: '#fff', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      <div style={{ padding: 16, borderBottom: '1px solid #eee', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Chat de la tarea #{taskId}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888', marginLeft: 8 }}
          title="Cerrar chat"
        >✖</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 8, textAlign: msg.userId === userId ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', background: msg.userId === userId ? '#e0ffe0' : '#f0f0f0', borderRadius: 8, padding: '6px 12px', maxWidth: 220 }}>
              <div style={{ fontSize: 12, color: '#888' }}>{msg.userId}</div>
              <div>{msg.content}</div>
              <div style={{ fontSize: 10, color: '#bbb', textAlign: 'right' }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ flex: 1, border: '1px solid #ccc', borderRadius: 4, padding: 8 }}
        />
        <button type="submit" style={{ marginLeft: 8, padding: '8px 16px' }}>Enviar</button>
      </form>
    </div>
  );
};

export default TaskChat;
