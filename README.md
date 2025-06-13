# Gestor de ventas para Rotisería
---
## Resumen

Este Trabajo Práctico Final correspondiente a la materia Programación 3 tiene como objetivo desarrollar una aplicación web que permita a una rotisería gestionar eficientemente los pedidos diarios, sus productos y los datos de los clientes.

La arquitectura se basa en un backend de microservicios y un frontend desacoplado, orquestados con Docker. Incluye un sistema de autenticación y autorización de usuarios basado en roles y tokens JWT.

---

## Arquitectura General

- **Backend**: Compuesto por cuatro microservicios independientes (Usuarios, Clientes, Productos y Pedidos), cada uno con su propia base de datos y lógica de negocio encapsulada.

- **Frontend**: Una aplicación de página única (SPA) desarrollada en React, que consume las APIs expuestas por los microservicios del backend.

- **Orquestación**: Se utiliza Docker para containerizar cada microservicio y sus bases de datos, así como el frontend, facilitando un entorno de desarrollo y despliegue unificado.
---

## Tecnologías Utilizadas

A continuación, se detallan las tecnologías, frameworks y librerías clave utilizadas en el desarrollo del proyecto.

### Backend (Python)

El backend se construyó utilizando el ecosistema de Django, aprovechando su robustez y rapidez para el desarrollo de APIs.

**Framework Principal**: Django y Django REST Framework (DRF) para la creación de APIs REST robustas y bien estructuradas.
**Autenticación**:
    Django REST Framework Simple JWT: Para la implementación de la autenticación basada en JSON Web Tokens (JWT), incluyendo la generación y validación de tokens de acceso y refresco.
**Base de Datos**:
    MySQL: Como motor de base de datos para cada microservicio.
    mysqlclient: Driver de Python para la conexión entre Django y MySQL.
**Manejo de Entorno**:
    python-decouple: Para gestionar variables de entorno y secretos (como claves de API y credenciales de base de datos) fuera del código fuente, utilizando archivos .env.
**Comunicación**:
    django-cors-headers: Para gestionar las políticas de Cross-Origin Resource Sharing (CORS), permitiendo que el frontend se comunique de forma segura con los microservicios del backend.

### Frontend (TypeScript)

El frontend es una aplicación construida con las siguientes tecnologías:

**Librería Principal**: React para la construcción de la interfaz de usuario declarativa y basada en componentes.
**Lenguaje**: TypeScript para añadir tipado estático a JavaScript.
**Herramienta de Build**: Vite como empaquetador y servidor de desarrollo, ofreciendo un arranque casi instantáneo y Hot Module Replacement (HMR) extremadamente rápido.
**Comunicación con APIs**:
    Axios: Como cliente HTTP para realizar las peticiones a los microservicios del backend, configurado con interceptores para el manejo automático de tokens de autenticación.
**Enrutamiento**:
    React Router DOM: Para gestionar la navegación y las rutas del lado del cliente en esta SPA.

### Infraestructura

**Containerización**: Docker y Docker Compose para definir, construir y ejecutar todo el entorno multi-contenedor de la aplicación de manera aislada y reproducible.
**Control de Versiones**: Git y GitHub para el seguimiento de cambios y la colaboración en equipo.

---

## Diagrama de Arquitectura

A continuación se presenta un bosquejo del diagrama de arquitectura que representa la estructura general de la aplicación, separando claramente el frontend del backend y mostrando los flujos principales entre las distintas funcionalidades:

### Microservicio Usuarios:

![Diagrama de Usuarios](graficos/usuariosnew.jpg)

### Microservicio Clientes:

![Diagrama de Clientes](graficos/clientes.jpg)

### Microservicio Productos:

![Diagrama de Productos](graficos/productos.jpg)

![Diagrama de Categorias](graficos/categorias.jpg)

### Microservicio Pedidos.

![Diagrama de Pedidos](graficos/pedidosnew.jpg)




---

## Diagrama Entidad-Relacion de la Base de Datos

Presentamos el esquema que representa las diversas entidades y relaciones que conforman los circuitos internos de la aplicación:

![Diagrama de Base de Datos](graficos/grafico2modif.jpg)


---

## Autores

- [Comas Tavella Juan Cruz](https://github.com/juancruzct12)
- [Facundo Martinez Nahuel Larroza](https://github.com/facu24fm)
- [Iván Gabriel Peceto](https://github.com/ivanPeceto)

---

## Scripts externos

- [wait-for-it](https://github.com/vishnubob/wait-for-it): Para la conexión entre microservicios y bases de datos.

