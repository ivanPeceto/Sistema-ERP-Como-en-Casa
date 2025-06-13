// Esta página es para que los usuarios puedan iniciar sesión en la aplicación.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import styles from '../styles/login.module.css'; 
import { login } from '../services/auth_service'



const LoginPage: React.FC = () => {
  // Acá guardariamos los datos que el usuario ingresa en los campos de usuario y contraseña.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    setError(null);
  
    if (!email || !password) {
      setError('Por favor, complete ambos campos.');
      return;
    }

    try {
      await login(email, password);
      navigate('/gestion');
    } catch (err: any) {
      console.error('Error de inicio de sesión: ', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('Credenciales incorrectas. Por favor, verifique su email y contraseña.');
        } else if (err.response.status === 400) {
          setError('Formato de email o contraseña inválido.');
        } else if (err.response.status >= 500) {
          setError('Error del servidor. Por favor, intente más tarde.');
        } else {
          setError('Ocurrió un error al intentar iniciar sesión.');
        }
      } else if (err.request) {
        setError('No se pudo conectar al servidor. Verifique su conexión a internet.');
      } else {
        setError('Ocurrió un error inesperado. Por favor, intente nuevamente.');
      }
    }
};

  const LogoIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
      <path d="M12.375 3h-.75L3 12.375v-.75L12.375 3zm0 0L21 12.375v-.75L12.375 3zm0 0L3 20.999l9.375-9.374-9.375-9.375zM12.375 3l9.375 9.375-9.375 9.374 9.375-9.374z" />
    </svg>
  );


  return (
    <div className={styles.authPageContainer}>
      <div className={styles.formContainer}>


        <div className={styles.formLogo}>
          <LogoIcon />
        </div>
        <h2 className={styles.title}>LOG IN</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          <button type="submit" className={styles.submitButton}>
            Iniciar sesión
          </button>
        </form>

        <Link to="/register" className={styles.switchFormLink}>
          No tienes una cuenta? Registrarse
        </Link>
      </div>
    </div>
  );
};



export default LoginPage; // Exportamos esta página para que pueda ser usada por el router.