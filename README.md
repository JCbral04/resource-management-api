# Resource Management API

API REST para gestion de recursos - Proyecto semestral Ingenieria Web II  
**Autor:** Juan Esteban Cabral Bautista  y Steven Rusinque Gutierrez
**Institucion:** Universidad Manuela Beltran (UMB)  
**Modulo:** Ingenieria Web 2 - 2026-262

## Tecnologias
- Node.js 22
- Express.js 4
- GitHub Copilot (asistente de codificacion)

## Instalacion

```bash
npm install
```
## Ejecucion

## Desarrollo
```
npm run dev
```
## Produccion
```
npm start
```
## Endpoints

| Metodo | Endpoint             | Descripcion                |
|--------|-----------------------|-----------------------------|
| GET    | /api/v1/hello          | Endpoint de bienvenida      |
| GET    | /api/v1/resources      | Listar todos los recursos   |
| GET    | /api/v1/resources/:id  | Obtener recurso por ID      |
| POST   | /api/v1/resources      | Crear nuevo recurso         |
| PUT    | /api/v1/resources/:id  | Actualizar recurso completo |
| PATCH  | /api/v1/resources/:id  | Actualizar recurso parcial  |
| DELETE | /api/v1/resources/:id  | Eliminar recurso            |

## Middleware

- **Logging:** Registra metodo, URL, timestamp, IP y tiempo de respuesta
- **Helmet:** Seguridad de headers HTTP
- **CORS:** Habilita cross-origin requests
- **Morgan:** Logger de requests HTTP
