/**
 * @file register_page.tsx
 * @brief Componente de React para la página de registro de nuevos usuarios.
 * @details
 * Este componente renderiza un formulario que permite a un nuevo usuario registrarse
 * en la aplicación proporcionando su nombre, email y una contraseña.
 * Utiliza el AuthContext para manejar la lógica de registro y el estado de autenticación.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import styles from '../styles/login.module.css'; 
import { useAuth } from '../context/auth_context';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  /**
   * @brief Maneja el envío del formulario de registro.
   * @details
   * Esta función se ejecuta cuando el usuario envía el formulario.
   * Realiza una validación de cliente para asegurar que las contraseñas coincidan.
   * Llama a la función `register` del AuthContext para comunicarse con el backend.
   * En caso de éxito, redirige al usuario al panel principal.
   * En caso de error, muestra un mensaje al usuario.
   * @param {FormEvent<HTMLFormElement>} event El evento del formulario.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    setError(null);

    if (password !== confirmPassword) {
      alert("¡Las contraseñas no coinciden! Por favor, verificá.");
      return;
    }

    try{
      await register(email, password, username);
      navigate('/gestion');

    } catch (err: any){
      console.error('Error de registro: ', err);
      if (err.response && err.response.data && err.response.data.email) {
        setError('Este correo electrónico ya está en uso.');
      } else {
        setError('Ocurrió un error durante el registro. Intente de nuevo.');
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
        <h2 className={styles.title}>REGISTRARSE</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Usuario</label>
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
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              className={styles.inputField}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            Register
          </button>
        </form>


        <Link to="/login" className={styles.switchFormLink}>
          ¿Ya tienes una cuenta? Inicia sesión
        </Link>
      </div>
    </div>
  );
};

// -------        -------        -------        -------        -------        -------

export default RegisterPage; // Exportamos esta página para que nuestro sistema de rutas la pueda usar.