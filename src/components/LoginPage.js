import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../stylesheets/LoginPage.css';

const LOGIN_URL = 'http://localhost:8080/api/auth/login';
const REGISTER_URL = 'http://localhost:8080/api/users/register';
const USER_ID_URL = 'http://localhost:8080/api/users/userID';

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
        await axios.post(REGISTER_URL, form);
        alert('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
        setIsRegister(false);
      } else {
        // Inicio de sesión
        const res = await axios.post(LOGIN_URL, { email: form.email, password: form.password });
        localStorage.setItem('token', res.data.token);

        // Extrae el correo del token (sub)
        let email = '';
        try {
          const decoded = jwtDecode(res.data.token);
          // Cambia 'sub' por el campo correcto si tu JWT usa otro nombre para el id
          if (decoded && decoded.sub) {
            email = decoded.sub;
          }
        } catch (e) {
          // Si hay error, email quedará como cadena vacía
        }

        // Llama al endpoint para obtener el userId usando el correo
        let userId = null;
        if (email) {
          const userIdRes = await axios.post(
            USER_ID_URL,
            email,
            {
              headers: {
                'Content-Type': 'text/plain',
                Authorization: `Bearer ${res.data.token}` // <-- agrega esto
              }
            }
          );
          userId = userIdRes.data;
        }

        if (userId) {
          localStorage.setItem('userId', userId);
        }
        if (onLogin) onLogin(res.data.token);
      }
    } catch (err) {
      setError(err.response?.data || err.message || 'Error de autenticación');
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