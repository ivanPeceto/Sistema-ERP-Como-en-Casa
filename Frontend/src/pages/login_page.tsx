// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Para enlaces y navegación
import styles from '../styles/login.module.css'; // Importamos los estilos compartidos

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Aquí iría la lógica de autenticación
    console.log('Login attempt:', { username, password, rememberMe });
    // Ejemplo de redirección después de un login exitoso (simulado):
    // if (username === "user" && password === "pass") {
    //   navigate('/'); // Redirige a la página principal
    // } else {
    //   alert("Credenciales incorrectas");
    // }
  };

  // Ícono de ejemplo para el logo (puedes usar react-icons o un SVG)
  const LogoIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
      <path d="M12.375 3h- argumentos.75L3 12.375v- argumentos.75L12.375 3zm0 0L21 12.375v- argumentos.75L12.375 3zm0 0L3 20.999l9.375-9.374-9.375-9.375zM12.375 3l9.375 9.375-9.375 9.374 9.375-9.374z" />
    </svg>
  );


  return (
    <div className={styles.authPageContainer}>
      <div className={styles.formContainer}>
        <div className={styles.formLogo}>
          {/* Puedes poner una imagen aquí o un ícono SVG */}
          <LogoIcon />
        </div>
        <h2 className={styles.title}>LOG IN</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className={styles.inputField}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.optionsContainer}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className={styles.forgotPasswordLink}> {/* Necesitarás una ruta para esto */}
              Forgot password?
            </Link>
          </div>
          <button type="submit" className={styles.submitButton}>
            Login
          </button>
        </form>
        <Link to="/register" className={styles.switchFormLink}>
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;