# Gestor de Ventas para "Como en Casa" - ERP para ventas y pedidos de rotisería.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) 

## Resumen

Nuestro sistema es una app web moderna diseñada para simplificar y optimizar la gestión diaria de una rotisería. Olvídate del papel y las planillas complicadas; esta herramienta te permite manejar pedidos, clientes y productos de forma eficiente y centralizada.

Construida con una arquitectura robusta de microservicios en el backend y una interfaz de usuario dinámica en el frontend, la aplicación es escalable, mantenible y fácil de desplegar gracias a Docker.

---

## Características Principales

* **Gestión Integral de Pedidos:**
    * Creación, visualización y edición de pedidos diarios.
    * Seguimiento de estados (Pendiente, Listo, Entregado).
    * Asignación de horarios de entrega.
    * Cálculo automático de totales.
    * Historial y búsqueda de pedidos por fecha o cliente.
* **Administración de Clientes:**
    * Base de datos de clientes con información de contacto.
    * **Búsqueda predictiva:** Sugerencias automáticas al ingresar nombres en nuevos pedidos.
    * **Creación rápida:** Guarda nuevos clientes directamente desde la toma de pedidos.
* **Catálogo de Productos:**
    * Gestión de productos, precios y categorías.
    * Control de disponibilidad.
* **Autenticación Segura:** Sistema de usuarios basado en roles con tokens JWT para proteger el acceso.
* **Arquitectura Moderna:** Backend desacoplado de microservicios y frontend SPA para mayor flexibilidad y escalabilidad.
* **Despliegue Sencillo:** Orquestación completa con Docker y Docker Compose.

---

## 📸 Vistazo Rápido 

*(TODO: Añadir screenshots de showcase :P)*
---

## Tecnologías Utilizadas

[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=white)](https://nginx.org/)
[![Bash](https://img.shields.io/badge/Bash-4EAA25?style=flat&logo=gnubash&logoColor=white)](https://www.gnu.org/software/bash/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)](https://axios-http.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

### Backend (Python)
* **Framework:** Django & Django REST Framework (DRF)
* **Autenticación:** Simple JWT (JSON Web Tokens)
* **Base de Datos:** MySQL (una por microservicio)

### Frontend (TypeScript)
* **Librería:** React
* **Lenguaje:** TypeScript
* **Build Tool:** Vite
* **Comunicaciones API:** Axios (con interceptores para JWT)
* **Routing:** React Router DOM

### Infraestructura
* **Containerización:** Docker & Docker Compose
* **Scripts Auxiliares:** [wait-for-it](https://github.com/vishnubob/wait-for-it)

---

## Arquitectura General

El sistema sigue un enfoque desacoplado:

* **Backend:** Cuatro microservicios independientes (Usuarios, Clientes, Productos, Pedidos) construidos con Django/DRF. Cada uno maneja su propia lógica de negocio y base de datos MySQL.
* **Frontend:** Una Single Page Application (SPA) desarrollada en React (con TypeScript) que interactúa con el backend a través de APIs REST.
* **Orquestación:** Docker y Docker Compose gestionan los contenedores de cada servicio, facilitando la configuración y el despliegue.

---

## Instalación y Ejecución

**Requisitos:**
* Docker ([Install Docker](https://docs.docker.com/engine/install/))
* Docker Compose ([Install Docker Compose](https://docs.docker.com/compose/install/))

**Pasos:**

1.  **Clona el repositorio:**
    ```bash
    git clone git@github.com:ivanPeceto/Sistema-ERP-Como-en-Casa.git
    cd sistema-erp-como-en-casa
    ```

2.  **Configura las variables de entorno:**
    * Copia el archivo de plantilla: `cp .env.template .env`
    * Edita el archivo `.env` y completa las credenciales de base de datos y otras configuraciones necesarias.

3.  **Dale permisos al script de instalación:**
    * Este script es muy versátil automatiza todas las tareas de instalación.
    ```bash
    chmod +x start_server.sh
    ```
    * Una vez que el script tenga permisos de ejecución, se puede ejecutar `./start_server.sh --help` para ver a detalle todas las funcionalidades.

4.  **Correr el scritp de instalación por primera vez:**
    * Para inicializar y configurar automáticamente todo el proyecto basta con correr este comando:
    ```bash
    ./start_server.sh --clean --migrate
    ```

5.  **Acceder al sistema:**
    * Verás en la consola el siguiente mensaje:
    ```bash
    Servidor disponible en: http://tu_dirección_ip/login
    ```
    * Dirigiendote a esa url puedes empezar a usar el sistema!

---

## Autores

* [Comas Tavella Juan Cruz](https://github.com/juancruzct12)
* [Facundo Martinez Nahuel Larroza](https://github.com/facu24fm)
* [Iván Gabriel Peceto](https://github.com/ivanPeceto)
* [Juan Manuel Rodriguez Spinker](https://github.com/jmrodriguezspinker)
---
