import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/countriesApi';

/**
 * LoginPage — authentication form.
 *
 * - Validates that both fields are non-empty before calling the backend.
 * - On success: stores the JWT in localStorage and redirects to /.
 * - On 401: shows "Credenciales inválidas" inline.
 */
export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError('');
    setPasswordError('');
    setAuthError('');

    // Inline validation — do not call backend if fields are empty
    let hasError = false;
    if (!email.trim()) {
      setEmailError('El email es requerido');
      hasError = true;
    }
    if (!password) {
      setPasswordError('La contraseña es requerida');
      hasError = true;
    }
    if (hasError) return;

    setIsSubmitting(true);
    try {
      const { token } = await login(email.trim(), password);
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      // Treat any 401-like error as invalid credentials
      if (err.message.includes('401')) {
        setAuthError('Credenciales inválidas');
      } else {
        setAuthError('Error al iniciar sesión. Intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem', textAlign: 'center' }}>
          Countries Explorer
        </h1>

        {/* Email field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={{
              padding: '0.5rem',
              border: `1px solid ${emailError ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          />
          {emailError && (
            <span role="alert" style={{ color: '#ef4444', fontSize: '0.875rem' }}>
              {emailError}
            </span>
          )}
        </div>

        {/* Password field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{
              padding: '0.5rem',
              border: `1px solid ${passwordError ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          />
          {passwordError && (
            <span role="alert" style={{ color: '#ef4444', fontSize: '0.875rem' }}>
              {passwordError}
            </span>
          )}
        </div>

        {/* Auth error */}
        {authError && (
          <p role="alert" style={{ color: '#ef4444', margin: 0, textAlign: 'center' }}>
            {authError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.6rem',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}
