// Esta página es para que los usuarios puedan iniciar sesión en la aplicación.

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import styles from '../styles/login.module.css'; 



const LoginPage: React.FC = () => {
  // Acá guardariamos los datos que el usuario ingresa en los campos de usuario y contraseña.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); 

  // Esta función se ejecuta cuando el usuario hace click en "Login".
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Evitamos que la página se recargue por defecto.
    event.preventDefault(); 
    console.log('Intento de login:', { username, password, rememberMe });
    // Cuando el backend este listo, acá se manejara la autenticación real y la redirección.
  };



  // Componente simple para mostrar un ícono que seria del logo.
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


          {/* Contenedor para la opción "Recordarme" y "Olvidé mi contraseña". */}
          <div className={styles.optionsContainer}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Recordarme
            </label>


            {/* Enlace para la función de recuperación de contraseña */}
            <Link to="/forgot-password" className={styles.forgotPasswordLink}>
              Olvidaste la contraseña?
            </Link>
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