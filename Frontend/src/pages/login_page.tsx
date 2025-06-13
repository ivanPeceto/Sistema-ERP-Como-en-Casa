/**
 * @file login_page.tsx
 * @brief Componente de React que renderiza la página de inicio de sesión.
 * @details
 * Esta página proporciona la interfaz para que los usuarios se autentiquen en la aplicación.
 * Contiene un formulario para ingresar email y contraseña, maneja el estado de dichos
 * campos, y se comunica con el `auth_service` para validar las credenciales
 * contra el backend.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import styles from '../styles/login.module.css'; 
import { login } from '../services/auth_service'


/**
 * @brief Componente funcional para la página de inicio de sesión.
 * @returns {React.ReactElement} El JSX que renderiza la página de login.
 */
const LoginPage: React.FC = () => {
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

    } catch (err:any){
      console.error('Error de inicio de sersión: ', err);
      if (err.response && err.response.data){
        setError('Credenciales invállidas. Por favor, intente de nuevo.')
      } else {
        setError('Ocurrió un error al intentar iniciar sesión.');
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

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            Login
          </button>
        </form>

        <Link to="/register" className={styles.switchFormLink}>
          No tienes una cuenta? Registrarse
        </Link>
      </div>
    </div>
  );
};

export default LoginPage; 