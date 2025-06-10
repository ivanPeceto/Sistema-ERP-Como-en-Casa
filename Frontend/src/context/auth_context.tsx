/**
 * @file AuthContext.tsx
 * @brief Proporciona un contexto de autenticación global para la aplicación.
 * @details
 * Este archivo crea un Contexto de React para gestionar y distribuir el estado
 * de autenticación (si el usuario está logueado, sus datos, etc.) y las funciones
 * relacionadas (login, logout) a cualquier componente que lo necesite.
 * Esto evita pasar props a través de múltiples niveles (prop drilling).
 */
import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, type AuthResponse } from '../services/auth_service';

// Tipado para los datos del usuario
interface User {
  id: number;
  email: string;
  nombre: string;
  is_superuser: boolean;
}

// Tipado para el valor que proveerá el contexto
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
}

// Creamos el contexto con un valor inicial por defecto.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Creamos el componente Proveedor del contexto.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Para comprobar el estado inicial

  useEffect(() => {
    // Al cargar la aplicación, comprueba si ya hay un usuario logueado en localStorage
    try {
      const storedUser = getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error al cargar datos de sesión", error);
      apiLogout(); // Limpia en caso de datos corruptos
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
    // Redirigir a la página de login
    window.location.href = '/login';
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * @brief Hook personalizado para consumir fácilmente el AuthContext.
 * @details
 * Este hook simplifica el uso del contexto. En lugar de importar useContext y AuthContext
 * en cada componente, simplemente importamos y usamos useAuth().
 * @returns {AuthContextType} El valor del contexto de autenticación.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};