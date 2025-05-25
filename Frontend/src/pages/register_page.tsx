// Esta página se encarga del registro de nuevos usuarios en nuestra aplicación.
// Permite a los usuarios crear una cuenta con sus datos.
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Para el enlace a la página de login.
import styles from '../styles/login.module.css'; // Nuestros estilos compartidos para formularios de autenticación.

// -------        -------        -------        -------        -------        -------

const RegisterPage: React.FC = () => {
  // Aca gestionamos el estado de los campos del formulario: nombre de usuario, email, contraseña y confirmación.
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Esta función se activa cuando el usuario intenta registrarse.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 

    // -------        -------        -------        -------        -------        -------

    // Primero, nos aseguramos de que las contraseñas que ingresó el usuario coincidan.
    if (password !== confirmPassword) {
      alert("¡Las contraseñas no coinciden! Por favor, verificá.");
      return;
    }

    console.log('Intento de registro:', { username, email, password });
    // Cuando el backend esté listo, vamos a manejar la respuesta del registro y la redirección.
    // Esto es solo para que este organizado
  };

  // -------        -------        -------        -------        -------        -------

  // Componente para el ícono que acompaña a nuestro logo en el formulario.
  const LogoIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
      <path d="M12.375 3h-.75L3 12.375v-.75L12.375 3zm0 0L21 12.375v-.75L12.375 3zm0 0L3 20.999l9.375-9.374-9.375-9.375zM12.375 3l9.375 9.375-9.375 9.374 9.375-9.374z" />
    </svg>
  );

  // -------        -------        -------        -------        -------        -------

  return (
    // Este es el contenedor principal de nuestra página de registro.
    <div className={styles.authPageContainer}>
      <div className={styles.formContainer}>
        {/* Aquí mostramos el ícono del logo. */}
        <div className={styles.formLogo}>
          <LogoIcon />
        </div>
        <h2 className={styles.title}>REGISTER</h2>

        // -------        -------        -------        -------        -------        -------

        {/* Este es el formulario donde el usuario introduce sus datos para crear la cuenta. */}
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

          // -------        -------        -------        -------        -------        -------

          {/* Este botón envía los datos del formulario para intentar el registro. */}
          <button type="submit" className={styles.submitButton}>
            Register
          </button>
        </form>

        // -------        -------        -------        -------        -------        -------

        {/* Enlace para que el usuario pueda volver a la página de login si ya tiene una cuenta. */}
        <Link to="/login" className={styles.switchFormLink}>
          ¿Ya tienes una cuenta? Inicia sesión
        </Link>
      </div>
    </div>
  );
};

// -------        -------        -------        -------        -------        -------

export default RegisterPage; // Exportamos esta página para que nuestro sistema de rutas la pueda usar.