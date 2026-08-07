# Taller Ingenieria Web II - Sesiones 1 y 2
## Autor: Juan Esteban Cabral Bautista y Steven Rusinque Gutierrez
## UMB - Ingenieria de Software - 2026-262

---

## 1. Respuestas a Preguntas Orientadoras

### Pregunta 1: Diferencia arquitectonica Node.js/Express vs Django (escenario colombiano)

La diferencia arquitectonica fundamental radica en el **modelo de concurrencia**:

| Aspecto | Node.js/Express | Django |
|---------|----------------|--------|
| **Modelo de concurrencia** | Event-driven, single-threaded con event loop | Multi-threaded sincrono por request (WSGI) |
| **Manejo de I/O** | Non-blocking: delega operaciones al SO y continua | Blocking: cada request ocupa un hilo hasta completar |
| **Uso de memoria** | Bajo (un hilo para miles de conexiones) | Alto (un hilo por request) |
| **Escenario ideal** | Alta concurrencia, I/O intensivo (APIs, chat, streaming) | CPU intensivo, procesamiento batch, admin panels |

**Escenario colombiano — Fintech (ej. Nequi, Daviplata, Bancolombia a la mano):**

Node.js/Express es ideal para una fintech colombiana porque el mercado nacional exige:
- **Pagos P2P en tiempo real:** Miles de usuarios consultan saldo simultaneamente (ej. pago de nomina a medianoche). El event loop de Node atiende estas solicitudes concurrentes sin crear hilos adicionales, manteniendo latencias bajas (<100ms).
- **Notificaciones push:** WebSockets integran naturalmente con el modelo event-driven para alertas de transacciones instantaneas.
- **Microservicios:** La ligereza de Node permite desplegar multiples instancias en contenedores Docker para cumplir regulaciones de la SFC (Superintendencia Financiera) con bajo costo de infraestructura.

Django seria preferible para:
- **Reportes regulatorios (SARLAFT, UIAF):** Procesamiento batch de millones de registros transaccionales donde el GIL (Global Interpreter Lock) de Python no es un cuello de botella si se usa multiprocesamiento.
- **Panel administrativo:** El admin automatico de Django acelera la gestion interna de usuarios y transacciones sospechosas.

**Ejemplo concreto:** En una app de pagos como Nequi, cuando 1 millon de usuarios consultan saldo simultaneamente a medianoche (pago de nomina), Node.js maneja esto eficientemente con I/O no bloqueante a la base de datos Redis/PostgreSQL, mientras que Django crearia un hilo por request, consumiendo significativamente mas memoria RAM y requiriendo escalamiento vertical costoso.

---

### Pregunta 2: Por que API-first con OpenAPI 3.0?

El enfoque **API-first** propone documentar el contrato antes de programar por dos razones estrategicas para equipos distribuidos:

**1. Desarrollo paralelo sin bloqueos (Time-to-market):**
Con el contrato OpenAPI 3.0 validado, el equipo frontend (en Bogota) puede generar mocks automaticos mediante Swagger Codegen y comenzar desarrollo UI/UX simultaneamente con el backend (en Medellin o remoto), sin esperar a que los endpoints esten implementados. Esto reduce el *time-to-market* en un 30-40% segun estudios de SmartBear (2023). El contrato actua como **fuente unica de verdad** (*single source of truth*), eliminando la dependencia secuencial entre equipos.

**2. Reduccion de deuda tecnica y malentendidos:**
Sin un contrato formal, el frontend espera `createdAt` en formato ISO 8601 (`2026-08-06T20:00:00Z`) pero el backend envia un timestamp Unix (`1722972000`). OpenAPI 3.0 define explicitamente tipos, formatos (`date-time`, `int64`), restricciones (`required`, `pattern`) y ejemplos. El validador integrado en Swagger Editor detecta estas discrepancias *antes* del despliegue, reduciendo el retrabajo (*rework*) en un 40-60% y evitando errores de integracion en produccion.

**Ventajas adicionales para equipos distribuidos:**
- **Testing automatizado:** Importar el YAML en Postman/Insomnia genera test suites automaticas que validan contratos en CI/CD.
- **Onboarding acelerado:** Nuevos desarrolladores comprenden la API sin leer codigo fuente, reduciendo curva de aprendizaje.
- **Versionado explicito:** El campo `version` en OpenAPI permite gestionar cambios *breaking* (v1.0.0 -> v2.0.0) mediante estrategias de deprecacion sin romper clientes existentes.

---

### Pregunta 3: Integracion de GitHub Copilot (tecnico y etico)

**Aspectos tecnicos considerados:**

1. **Generacion de boilerplate:** Copilot acelero la creacion del esqueleto Express (middleware, estructura de carpetas MVC), pero verifique manualmente que `helmet()` estuviera correctamente configurado con politicas de Content Security Policy (CSP) para prevenir XSS, una vulnerabilidad comun que los LLMs a veces omiten.

2. **Sugerencias de codigo:** Propuso el middleware de logging, pero la primera version uso `Date.now()` antes de `next()`, midiendo el tiempo de ejecucion del middleware en lugar del request completo. Corregi esto usando el evento `res.on('finish')` del ciclo de vida de Express, asegurando metricas reales de latencia.

3. **Tests unitarios:** Genero templates Jest, pero tuve que anadir casos edge (IDs inexistentes, payloads con tipos incorrectos, validacion de campos requeridos) que Copilot no cubrio inicialmente.

**Aspectos eticos (ACM Code of Ethics 2023):**

- **Principio 1.3 (Honestidad):** Todo codigo generado por Copilot fue revisado, comprendido y adaptado. No se presenta como creacion 100% propia sin analisis critico. Se incluye nota explicita en el README atribuyendo el uso de la herramienta.

- **Principio 1.5 (Respeto a la propiedad intelectual):** Se verifico que las sugerencias no contuvieran snippets con licencias incompatibles (GPL en proyecto MIT). Se atribuye en comentarios cuando Copilot proporciono algoritmos especificos (ej. patron de logging con eventos).

- **Principio 1.6 (Respeto a la privacidad):** No se ingresaron datos personales reales, credenciales ni informacion sensible de la UMB como prompts para Copilot, evitando filtracion potencial a los modelos de entrenamiento de OpenAI.

- **Principio 2.1 (Calidad profesional):** Se realizo *code review* manual del codigo generado, corrigiendo vulnerabilidades potenciales (validacion estricta de inputs con `parseInt()`, manejo de errores 404/500, prevencion de inyeccion mediante desestructuracion controlada de `req.body`).

**Documentacion de uso:** En el README se incluye: *"GitHub Copilot fue utilizado como asistente de codificacion; todo el codigo fue revisado, comprendido y adaptado por el autor."*

---

### Pregunta 4: Dificultades y estrategias de superacion

**Mayor dificultad tecnica:** La configuracion del middleware de logging para capturar el **tiempo de respuesta real** del servidor.

Inicialmente, Copilot genero:
```javascript
const start = Date.now();
next();
const duration = Date.now() - start; // INCORRECTO
```

Esto media el tiempo de ejecucion del middleware (microsegundos), no el tiempo total del request completo (milisegundos), porque `next()` solo pasa al siguiente middleware pero no espera a que la respuesta se envie al cliente.

**Estrategia de superacion aplicada:**

1. **Debugging con `console.log()` etapa por etapa:** Inserte logs en `req`, `next()`, y `res` para visualizar el flujo de ejecucion y comprender que `next()` es sincrono pero la respuesta HTTP es asincrona.

2. **Consulta documentacion oficial de Express:** Revise la API reference de `response` events (https://expressjs.com/en/api.html#res), identificando el evento `finish` que se emite cuando Express envia la respuesta al socket HTTP.

3. **Testing manual con Postman + PowerShell:** Realice requests deliberadamente lentos (agregando `setTimeout` temporal) y verifique que los tiempos mostrados en consola coincidieran con los tiempos de red del navegador.

4. **Iteracion critica con Copilot:** En lugar de aceptar la primera sugerencia, use Copilot Chat con prompts especificos: *"Explain why next() doesn't wait for response in Express middleware"* y *"Show me how to measure total response time using res events"*. Esto genero la solucion correcta con `res.on('finish', callback)`.

**Dificultad en diseno OpenAPI:** Definir correctamente los schemas reutilizables (`$ref`) para evitar violacion del principio DRY (*Don't Repeat Yourself*). La estrategia fue separar `ResourceInput` (campos enviados por el cliente en POST/PUT) de `Resource` (incluye `id` y `createdAt` generados por el servidor), estableciendo claramente los `required` fields de cada operacion y evitando duplicacion de definiciones de propiedades.

---

## 2. Glosario Tecnico

### Sesion 1 — Glosario Node.js/Express (Ingles -> Espanol)

| Termino en Ingles | Definicion en Espanol |
|-------------------|----------------------|
| **Event Loop** | Bucle de eventos: mecanismo que permite a Node.js ejecutar operaciones de entrada/salida de manera no bloqueante, delegando operaciones al sistema operativo y continuando con el codigo siguiente sin esperar resultados. |
| **Middleware** | Software intermedio: funcion que tiene acceso al objeto de solicitud (`req`), respuesta (`res`) y a la siguiente funcion en el ciclo request-response (`next`), permitiendo ejecutar logica transversal (logging, autenticacion, validacion). |
| **Non-blocking I/O** | Entrada/salida no bloqueante: modelo donde el hilo principal no espera activamente a que una operacion (lectura de archivo, query a base de datos) termine, sino que registra un callback para continuar cuando el SO notifique su finalizacion. |
| **Routing** | Enrutamiento: mecanismo que define como responde una aplicacion a una solicitud de cliente en un endpoint especifico, combinando un URI y un metodo HTTP (`GET /resources/:id`). |
| **Request/Response Cycle** | Ciclo solicitud-respuesta: flujo completo donde el cliente envia una peticion HTTP, el servidor la procesa a traves de middleware y handlers, y devuelve una respuesta con datos o codigos de estado HTTP. |

### Sesion 2 — Terminos Clave OpenAPI 3.0 (Ingles)

| Termino | Definicion en Ingles |
|---------|---------------------|
| **Schema** | A structured definition of the data model, describing the shape, types, formats, and constraints of request/response payloads using JSON Schema format. |
| **Path** | A relative URL endpoint (e.g., `/resources/{id}`) that identifies a specific resource or operation within the API surface. |
| **Endpoint** | The combination of an HTTP method and a path that represents a specific operation the API can perform (e.g., `GET /resources`). |
| **Request Body** | The payload sent by the client to the server in POST, PUT, or PATCH operations, defined by a schema in the OpenAPI document and validated against it. |
| **Response** | The data returned by the server after processing a request, including HTTP status codes, headers, and a structured body defined by schemas and examples. |

---

## 3. Video en Ingles (1–3 minutos)

---

## 4. Referencias Bibliograficas (APA 7)

Brown, E. (2023). *Web development with Node and Express* (3rd ed.). O'Reilly Media. https://learning.oreilly.com

Fielding, R., & Reschke, J. (2022). *HTTP semantics* (RFC 9110). IETF. https://www.rfc-editor.org/rfc/rfc9110

Association for Computing Machinery. (2023). *ACM code of ethics and professional conduct*. https://www.acm.org/code-of-ethics

SmartBear Software. (2023). *State of API 2023 report*. https://www.smartbear.com/resources/reports/state-of-api/

Traversy Media. (2024). *Node.js crash course* [Video]. YouTube. https://youtu.be/fBNz5xF-Kx4

freeCodeCamp. (2024). *REST API design best practices* [Video]. YouTube. https://youtu.be/fFEgSU2IWH0

OpenAPI Initiative. (2023). *OpenAPI specification version 3.0.3*. https://spec.openapis.org/oas/v3.0.3
