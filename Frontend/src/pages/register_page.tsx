// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/login.module.css';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Aquí iría la lógica de registro
    console.log('Register attempt:', { username, email, password });
    // Ejemplo de redirección después de un registro exitoso (simulado):
    // navigate('/login');
  };

  // Ícono de ejemplo para el logo
  const LogoIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
      <path d="M12.375 3h- argumentos.75L3 12.375v- argumentos.75L12.375 3zm0 0L21 12.375v- argumentos.75L12.375 3zm0 0L3 20.999l9.375-9.374-9.375-9.375zM12.375 3l9.375 9.375-9.375 9.374 9.375-9.374z" />
    </svg>
  );

  return (
    <div className={styles.authPageContainer}>
      <div className={styles.formContainer}>
        <div className={styles.formLogo}>
          <LogoIcon />
        </div>
        <h2 className={styles.title}>REGISTER</h2>
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
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className={styles.inputField}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Register
          </button>
        </form>
        <Link to="/login" className={styles.switchFormLink}>
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;