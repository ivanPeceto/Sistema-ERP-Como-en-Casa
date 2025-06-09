/**
 * @file apiClient.ts
 * @brief Archivo de configuración central para el cliente HTTP (Axios).
 * @details
 * Este archivo crea y configura una instancia única de Axios que se utilizará en toda
 * la aplicación para comunicarse con los microservicios del backend.
 * Incluye interceptores para manejar automáticamente la inyección de tokens de autenticación
 * y la lógica para refrescar tokens de acceso cuando expiran.
 * Esta centralización del manejo de la API promueve un código más limpio y mantenible.
 */

import axios from 'axios';
import { getAccessToken, getRefreshToken } from '../services/authService';

/**
 * @brief URL base para el microservicio de autenticación y usuarios.
 * @details
 * Se obtiene de las variables de entorno de Vite. La variable VITE_API_USUARIOS_URL
 * se inyecta durante el proceso de build o al levantar el servidor de desarrollo,
 * y su valor se define en el archivo docker-compose.yml.
 * @see docker-compose.yml
 */
const baseURL = import.meta.env.VITE_API_USUARIOS_URL;

/**
 * @brief Instancia de Axios pre-configurada para la aplicación.
 * @details
 * Se crea una instancia de Axios con una baseURL predeterminada para el servicio de usuarios.
 * Todos los interceptores se aplican a esta instancia.
 * Esta instancia debe ser importada por los servicios (como authService, clienteService, etc.)
 * para realizar las llamadas a la API.
 */
const apiClient = axios.create({
  baseURL: `${baseURL}/api`,
});

/**
 * @brief Interceptor de Petición (Request Interceptor).
 * @details
 * Este interceptor se ejecuta ANTES de que cada petición sea enviada desde la aplicación.
 * Su principal función es añadir el token de acceso (access token) a la cabecera
 * 'Authorization' de cada petición saliente. Esto automatiza el proceso de autenticación
 * para las rutas protegidas del backend.
 *
 * @param {import('axios').AxiosRequestConfig} config La configuración de la petición saliente.
 * @returns {import('axios').AxiosRequestConfig} La configuración modificada con la cabecera de autorización.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Obtiene el token de acceso desde el almacenamiento local.
    const token = getAccessToken();
    if (token) {
      // Si el token existe, lo añade a la cabecera como un 'Bearer Token'.
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Devuelve la configuración para que la petición continúe.
    return config;
  },
  (error) => {
    // Si ocurre un error al configurar la petición, se rechaza la promesa.
    return Promise.reject(error);
  }
);


/**
 * @brief Interceptor de Respuesta (Response Interceptor).
 * @details
 * Este interceptor se ejecuta DESPUÉS de recibir una respuesta del backend.
 * Su función principal es manejar los errores de autenticación, específicamente el
 * error 401 (Unauthorized), que usualmente indica que el 'accessToken' ha expirado.
 * * Si se detecta un error 401, el interceptor intentará usar el 'refreshToken'
 * para obtener un nuevo 'accessToken'. Si tiene éxito, reintentará la petición
 * original que falló, de forma transparente para el usuario. Si el refresco falla,
 * limpiará la sesión del usuario y lo redirigirá a la página de login.
 *
 * @param {import('axios').AxiosResponse} response La respuesta exitosa de la API.
 * @param {import('axios').AxiosError} error El objeto de error si la petición falló.
 * @returns {Promise} Una promesa que se resuelve con la respuesta o se rechaza con el error.
 */
apiClient.interceptors.response.use(
  // Para respuestas exitosas (código 2xx), simplemente las devuelve sin hacer nada.
  (response) => response,
  
  // Para respuestas con error, se ejecuta esta función asíncrona.
  async (error) => {
    const originalRequest = error.config;
    
    // Comprueba si el error es un 401 y si no hemos reintentado ya esta petición.
    // La bandera '_retry' es una propiedad personalizada para evitar bucles infinitos.
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcar la petición para no volver a reintentarla.
      
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // Si no hay un refresh token, no hay nada que hacer. Se redirige al login.
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Intenta obtener un nuevo access token usando el refresh token.
        // Se usa axios.post directamente aquí para evitar un bucle con el interceptor.
        const response = await axios.post(`${baseURL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        // Si se obtiene el nuevo token, se guarda en el almacenamiento local.
        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);

        // Actualiza las cabeceras por defecto de apiClient y de la petición original.
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Reintenta la petición original que había fallado, ahora con el nuevo token.
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error("No se pudo refrescar el token", refreshError);
        // Si el refresh token también es inválido o expiró, la sesión del usuario ha terminado.
        // Se limpian todos los datos de autenticación del almacenamiento local.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Se redirige forzosamente al usuario a la página de login.
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Para cualquier otro error que no sea 401, simplemente lo devuelve.
    return Promise.reject(error);
  }
);

/**
 * @brief Exportación por defecto de la instancia de Axios configurada.
 */
export default apiClient;