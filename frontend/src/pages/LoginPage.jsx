import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/countriesApi';

const styles = `
  .login-bg {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    position: relative;
    overflow: hidden;
  }
  .login-bg::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
    top: -200px; left: -200px;
    border-radius: 50%;
  }
  .login-bg::after {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%);
    bottom: -150px; right: -150px;
    border-radius: 50%;
  }
  .login-card {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(99,102,241,0.2);
    padding: 2.5rem;
    border-radius: 1.5rem;
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
    z-index: 1;
    box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
  }
  .login-logo {
    text-align: center;
    margin-bottom: 0.5rem;
  }
  .login-logo .globe {
    font-size: 3rem;
    display: block;
    margin-bottom: 0.75rem;
    filter: drop-shadow(0 0 20px rgba(99,102,241,0.6));
  }
  .login-logo h1 {
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
  }
  .login-logo p {
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 0.25rem;
  }
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .field-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .field-input {
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 0.75rem;
    font-size: 1rem;
    color: #f1f5f9;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .field-input:focus {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(129,140,248,0.15);
  }
  .field-input.error { border-color: #f87171; }
  .field-error {
    font-size: 0.8rem;
    color: #f87171;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .auth-error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    color: #f87171;
    font-size: 0.9rem;
    text-align: center;
  }
  .login-btn {
    padding: 0.85rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 15px rgba(99,102,241,0.4);
  }
  .login-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99,102,241,0.5);
  }
  .login-btn:active:not(:disabled) { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`;

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
    setEmailError(''); setPasswordError(''); setAuthError('');
    let hasError = false;
    if (!email.trim()) { setEmailError('El email es requerido'); hasError = true; }
    if (!password) { setPasswordError('La contraseña es requerida'); hasError = true; }
    if (hasError) return;
    setIsSubmitting(true);
    try {
      const { token } = await login(email.trim(), password);
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      if (err.message.includes('401')) setAuthError('Credenciales inválidas');
      else setAuthError(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-bg">
        <form onSubmit={handleSubmit} noValidate className="login-card">
          <div className="login-logo">
            <span className="globe">🌍</span>
            <h1>Countries Explorer</h1>
            <p>Explora el mundo, un país a la vez</p>
          </div>

          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" placeholder="tu@email.com"
              className={`field-input${emailError ? ' error' : ''}`}
            />
            {emailError && <span role="alert" className="field-error">⚠ {emailError}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" placeholder="••••••••"
              className={`field-input${passwordError ? ' error' : ''}`}
            />
            {passwordError && <span role="alert" className="field-error">⚠ {passwordError}</span>}
          </div>

          {authError && <div role="alert" className="auth-error">⚠ {authError}</div>}

          <button type="submit" disabled={isSubmitting} className="login-btn">
            {isSubmitting ? '⏳ Iniciando sesión...' : '🚀 Iniciar sesión'}
          </button>
        </form>
      </div>
    </>
  );
}
