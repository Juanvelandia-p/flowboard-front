import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../stylesheets/MainMenu.css';
import { useWebSocket } from '../context/WebSocketContext'; // Asegúrate de tener este contexto
import TeamPanel from './TeamPanel';

export default function MainMenu({ token, onLogout, onSelectTeam, userEmail, userId }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTeam, setNewTeam] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef();

  useEffect(() => {
    fetchTeams();
    fetchPendingInvites();
    // eslint-disable-next-line
  }, []);

  // Refresca solo las invitaciones cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingInvites();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cierra el menú de notificaciones si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchTeams = () => {
    setLoading(true);
    // Obtener equipos
    axios.get('https://flowboard-b3avawgzaqftbtcd.canadacentral-01.azurewebsites.net/api/teams/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setTeams(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los equipos');
        setLoading(false);
      });
  };

  const fetchPendingInvites = () => {
    setLoadingInvites(true);
    // Obtener invitaciones pendientes
    axios.get('https://flowboard-b3avawgzaqftbtcd.canadacentral-01.azurewebsites.net/api/teams/pending-invitations', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setPendingInvites(res.data);
        setLoadingInvites(false);
      })
      .catch(() => setLoadingInvites(false));
  };

  const handleAddInvite = (e) => {
    e.preventDefault();
    if (inviteEmail && !invitedEmails.includes(inviteEmail)) {
      setInvitedEmails([...invitedEmails, inviteEmail]);
      setInviteEmail('');
    }
  };

  const handleRemoveInvite = (email) => {
    setInvitedEmails(invitedEmails.filter(e => e !== email));
  };

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeam.trim()) return;
    // Crear equipo
    axios.post('https://flowboard-b3avawgzaqftbtcd.canadacentral-01.azurewebsites.net/api/teams', {
      name: newTeam,
      invitedEmails: invitedEmails
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setShowCreate(false);
        setNewTeam('');
        setInvitedEmails([]);
        fetchTeams();
      })
      .catch(() => alert('No se pudo crear el equipo'));
  };

  const handleAcceptInvite = (teamId) => {
    // Aceptar invitación
    axios.post(`https://flowboard-b3avawgzaqftbtcd.canadacentral-01.azurewebsites.net/api/teams/${teamId}/accept-invitation`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        fetchTeams();
        fetchPendingInvites();
      })
      .catch(() => alert('No se pudo aceptar la invitación'));
  };

  return (
    <div className="main-menu-root">
      <header className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Campana al extremo izquierdo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button
              className="notification-bell"
              onClick={() => setShowNotifications((v) => !v)}
              title="Notificaciones"
            >
              <span role="img" aria-label="notificaciones">🔔</span>
              {pendingInvites.length > 0 && (
                <span className="notification-count">
                  {pendingInvites.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <h4>Invitaciones pendientes</h4>
                {loadingInvites ? (
                  <div>Cargando...</div>
                ) : pendingInvites.length === 0 ? (
                  <div>No tienes invitaciones pendientes.</div>
                ) : (
                  <ul>
                    {pendingInvites.map(team => (
                      <li key={team.id} style={{ marginBottom: 10 }}>
                        <span>Equipo <b>{team.name}</b></span>
                        <button
                          onClick={() => handleAcceptInvite(team.id)}
                        >
                          Aceptar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Logo centrado */}
        <img src={logo} alt="FlowBoard logo" className="header-logo" />
        {/* Botón cerrar sesión al extremo derecho */}
        <button className="logout-btn" onClick={onLogout}>Cerrar sesión</button>
      </header>
      <main className="main-menu-content" style={{ margin: '0 auto', maxWidth: 700 }}>
        <h2>Mis equipos</h2>
        {/* Botón para crear equipo siempre visible */}
        <button className="main-menu-create-btn" onClick={() => setShowCreate(true)} style={{ marginBottom: 24 }}>
          Crear equipo
        </button>
        {showCreate && (
          <form className="main-menu-create-form" onSubmit={handleCreateTeam}>
            <input
              type="text"
              value={newTeam}
              onChange={e => setNewTeam(e.target.value)}
              placeholder="Nombre del equipo"
              required
            />
            <div style={{ margin: '8px 0' }}>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="Correo de usuario a invitar"
              />
              <button type="button" onClick={handleAddInvite} style={{ marginLeft: 8 }}>Agregar</button>
            </div>
            <div>
              {invitedEmails.map(email => (
                <span key={email} style={{ marginRight: 8 }}>
                  {email}
                  <button type="button" onClick={() => handleRemoveInvite(email)} style={{ marginLeft: 4 }}>x</button>
                </span>
              ))}
            </div>
            <button type="submit">Crear</button>
            <button type="button" onClick={() => setShowCreate(false)}>Cancelar</button>
          </form>
        )}
        {loading && <div className="main-menu-loading">Cargando equipos...</div>}
        {error && <div className="main-menu-error">{error}</div>}
        {!loading && teams.length === 0 && (
          <div className="main-menu-empty">
            <div>No tienes equipos.</div>
          </div>
        )}
        {!loading && teams.length > 0 && (
          <div>
            {teams.map(team => (
              <TeamPanel
                key={team.id}
                team={team}
                token={token}
                userId={userId}
                onTeamDeleted={fetchTeams}
                onMemberRemoved={fetchTeams}
                onMemberAdded={fetchTeams}
                onSelectTeam={onSelectTeam} // <-- agrega esto
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}