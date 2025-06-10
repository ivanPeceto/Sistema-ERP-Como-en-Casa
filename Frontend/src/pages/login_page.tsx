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
    // Contenedor principal de la página de login
    <div className={styles.authPageContainer}>
      <div className={styles.formContainer}>


        {/* El área del logo en la parte superior del formulario. */}
        <div className={styles.formLogo}>
          <LogoIcon />
        </div>
        <h2 className={styles.title}>LOG IN</h2>

        {/* formulario */}
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

          {/* Botón para iniciar sesión. */}
          <button type="submit" className={styles.submitButton}>
            Login
          </button>
        </form>

        {/* Enlace para ir a la página de registro si el usuario no tiene una cuenta. */}
        <Link to="/register" className={styles.switchFormLink}>
          No tienes una cuenta? Registrarse
        </Link>
      </div>
    </div>
  );
};



export default LoginPage; // Exportamos esta página para que pueda ser usada por el router.