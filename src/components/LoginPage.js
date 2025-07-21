import React, { useState } from 'react';
import '../stylesheets/LoginPage.css';

const LOGIN_URL = 'http://localhost:8080/api/auth/login';
const REGISTER_URL = 'http://localhost:8080/api/users/register';

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        // Registro de usuario
        const res = await fetch(REGISTER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Error al registrar usuario');
        }
        alert('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
        setIsRegister(false);
      } else {
        // Inicio de sesión
        const res = await fetch(LOGIN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Credenciales inválidas');
        }
        const data = await res.json();
        localStorage.setItem('token', data.token);
        if (onLogin) onLogin(data.token);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">{isRegister ? 'Crear usuario' : 'Iniciar sesión'}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="login-field">
              <label>Usuario:</label>
              <input type="text" name="username" value={form.username} onChange={handleChange} required />
            </div>
          )}
          <div className="login-field">
            <label>Correo:</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="login-field">
            <label>Contraseña:</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Procesando...' : isRegister ? 'Registrar' : 'Entrar'}
          </button>
        </form>
        <div className="login-switch">
          <button
            type="button"
            onClick={() => setIsRegister(r => !r)}
            className="login-switch-btn"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}