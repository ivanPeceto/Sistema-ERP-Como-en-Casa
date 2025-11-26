import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  email: string;
  nombre: string;
  is_superuser: boolean;
  rol?: string;
  exp: number;
}

export const hasRole = (token: string | null, allowedRoles: string[]): boolean => {
  if (!token) return false;

  try {
    const decoded: JwtPayload = jwtDecode(token);

    // Revisar expiración
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return false;

    // Revisar rol
    if (!decoded.rol) return false;
    return allowedRoles.includes(decoded.rol);
  } catch (err) {
    console.error('Error decodificando token:', err);
    return false;
  }
};
