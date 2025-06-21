/**
 * @file AuthContext.tsx
 * @brief Proporciona un contexto de autenticación global para la aplicación.
 * @details
 * Este archivo crea un Contexto de React para gestionar y distribuir el estado
 * de autenticación (si el usuario está logueado, sus datos, etc.) y las funciones
 * relacionadas (login, logout, register) a cualquier componente que lo necesite.
 * Esto evita pasar props a través de múltiples niveles y centraliza
 * toda la lógica de estado de la sesión.
 */

import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
<<<<<<< HEAD
import { login as apiLogin, logout as apiLogout, register as apiRegister, getCurrentUser} from '../services/auth_service';
import type { AuthResponse } from '../types/models';
import { type User } from '../types/models';

=======
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/auth_service';
import { type User, type AuthResponse } from '../types/models';
import {getCurrentUser} from '../api/apiClient';
>>>>>>> main

/**
 * @interface AuthContextType
 * @brief Define la forma del valor que nuestro contexto de autenticación proveerá.
 * @details Incluye el estado de la sesión y las funciones para modificar dicho estado.
 */
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  register: (email: string, password: string, username: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


/**
 * @brief Componente proveedor que envuelve la aplicación.
 * @details Este componente es el responsable de mantener el estado de la autenticación
 * y de proveerlo a todos sus componentes hijos a través del `AuthContext.Provider`.
 * Debe envolver a toda la aplicación o a las partes que necesiten acceso al estado de sesión.
 * @param {{ children: ReactNode }} props Los componentes hijos que serán envueltos.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); 

  /**
   * @brief Hook de efecto que se ejecuta una sola vez al montar el componente.
   * @details Su propósito es verificar si ya existe una sesión activa en el `localStorage`.
   * Esto permite que la sesión del usuario persista entre recargas de la página.
   */  
  useEffect(() => {
    try {
      const storedUser = getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error al cargar datos de sesión", error);
      apiLogout(); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * @brief Maneja el inicio de sesión del usuario.
   * @details Llama a la función `login` del servicio, y si es exitosa,
   * actualiza el estado del contexto con los datos del usuario y los tokens.
   */
  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  /**
   * @brief Maneja el registro de un nuevo usuario.
   * @details Llama a la función `register` del servicio y, si tiene éxito,
   * autentica al nuevo usuario inmediatamente.
   */
  const register = async (email: string, password: string, username: string) => {
    const response = await apiRegister(email, password, username);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };


  /**
   * @brief Cierra la sesión del usuario.
   * @details Llama a la función `logout` del servicio para limpiar los tokens y
   * resetea el estado local. Finalmente, redirige al usuario a la página de login.
   */
  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * @brief Hook personalizado para consumir fácilmente el AuthContext.
 * @details
 * Este hook simplifica el uso del contexto. En lugar de importar `useContext` y `AuthContext`
 * en cada componente, simplemente se importa y se usa `useAuth()`.
 * @returns {AuthContextType} El valor completo del contexto de autenticación.
 * @throws {Error} Si el hook se usa fuera de un `AuthProvider`.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};