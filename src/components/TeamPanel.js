import React, { useState } from 'react';
import axios from 'axios';
import '../stylesheets/TeamPanel.css';

export default function TeamPanel({ team, token, userId, onTeamDeleted, onMemberRemoved, onMemberAdded, onSelectTeam }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [removing, setRemoving] = useState(false);
  const [adding, setAdding] = useState(false);

  const isLeader = String(team.leaderId) === String(userId);

  // Maneja el click en el panel (evita que los clicks en botones internos lo disparen)
  const handlePanelClick = (e) => {
    // Si el click viene de un botón, no navegues
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    if (onSelectTeam) onSelectTeam(team);
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar este equipo?')) return;
    setRemoving(true);
    try {
      // Eliminar equipo
      await axios.delete(`https://flowboard-b3avawgzaqftbtcd.canadacentral-01.azurewebsites.net/api/teams/${team.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onTeamDeleted) onTeamDeleted(team.id);
    } catch {
      alert('No se pudo eliminar el equipo');
    }
    setRemoving(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setAdding(true);
    try {
      // Invitar miembro
      await axios.post(`https://flowboard-b3avawgzaqftbtcd.canadacentral-01.azurewebsites.net/api/teams/${team.id}/invite`, { email: inviteEmail }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInviteEmail('');
      if (onMemberAdded) onMemberAdded(inviteEmail);
      alert('Invitación enviada');
    } catch {
      alert('No se pudo invitar al usuario');
    }
    setAdding(false);
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este miembro?')) return;
    try {
      // Eliminar miembro
      await axios.delete(`https://flowboard-b3avawgzaqftbtcd.canadacentral-01.azurewebsites.net/api/teams/${team.id}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onMemberRemoved) onMemberRemoved(memberId);
    } catch {
      alert('No se pudo eliminar el miembro');
    }
  };

  return (
    <div
      className="team-panel-container"
      onClick={handlePanelClick}
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      role="button"
      aria-label={`Seleccionar equipo ${team.name}`}
    >
      <h2>{team.name}</h2>
      <div className="team-panel-info">
        <div><b>Líder (ID):</b> {team.leaderId}</div>
        <div><b>Integrantes (IDs):</b></div>
        <ul className="team-panel-members">
          {(team.memberIds || []).map(memberId => (
            <li key={memberId}>
              {memberId}
              {isLeader && memberId !== team.leaderId && (
                <button
                  className="team-panel-remove-btn"
                  onClick={e => { e.stopPropagation(); handleRemoveMember(memberId); }}
                  title="Eliminar miembro"
                >Eliminar</button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {isLeader && (
        <div className="team-panel-actions">
          <form
            onSubmit={e => { e.stopPropagation(); handleAddMember(e); }}
            className="team-panel-invite-form"
          >
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="Correo del nuevo miembro"
              required
              disabled={adding}
            />
            <button type="submit" disabled={adding}>Agregar miembro</button>
          </form>
          <button
            className="team-panel-delete-btn"
            onClick={e => { e.stopPropagation(); handleDeleteTeam(); }}
            disabled={removing}
          >
            Eliminar equipo
          </button>
        </div>
      )}
    </div>
  );
}