import React, { useEffect, useState } from 'react';

export default function BoardListPage({ token, onSelectBoard }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reemplaza la URL por la de tu backend
    fetch('http://localhost:8080/api/boards', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBoards(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los tableros');
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div className="board-list-loading">Cargando tableros...</div>;
  if (error) return <div className="board-list-error">{error}</div>;

  return (
    <div className="board-list-container">
      <h2>Selecciona un tablero</h2>
      <ul className="board-list">
        {boards.map(board => (
          <li key={board.id} className="board-list-item">
            <button onClick={() => onSelectBoard(board)} className="board-list-btn">
              {board.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}