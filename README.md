# Reworn — Documentación en español

Reworn es un pequeño marketplace de ropa de segunda mano. Está construido con React, Vite, Tailwind CSS, Express, MongoDB/Mongoose, autenticación JWT y Cloudinary.

La aplicación está dividida en dos proyectos que se pueden desplegar de forma independiente:

```text
PEC5/
├── backend/   API de Express, modelos de Mongoose, autenticación y cargas
├── frontend/  Aplicación React creada con Vite
└── README.md
```

## Características

- Catálogo público de ropa con filtros de búsqueda, categoría, talla y estado
- Registro e inicio de sesión de usuarios
- Encriptación de contraseñas con `bcryptjs`
- Autenticación JWT almacenada en una cookie HTTP-only
- Los usuarios pueden crear anuncios y editar, marcar como vendidos u ocultar únicamente sus propios anuncios
- Los anuncios admiten entre 1 y 5 imágenes alojadas en Cloudinary
- Eliminación lógica mediante `status: "hidden"`
- Interfaz responsive con Tailwind y navegación con React Router
- Despliegues separados en Vercel para el frontend y el backend

---

## Instalación local

### Requisitos

Instala:

- Node.js 20 o posterior
- npm
- Un clúster de MongoDB Atlas o una instancia local de MongoDB
- Una cuenta de Cloudinary

### 1. Clona el repositorio

```bash
git clone <tu-url-del-repositorio>
cd PEC5
```

### 2. Configura el backend

```bash
cd backend
npm install
cp .env.example .env
```

Abre `backend/.env` y agrega tus valores:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/<base-de-datos>?retryWrites=true&w=majority
JWT_SECRET=usa-un-secreto-largo-y-aleatorio
JWT_EXPIRES_IN=7d
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
CLOUDINARY_TIMEOUT_MS=20000
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
COOKIE_SAME_SITE=lax
MAX_IMAGE_BYTES=786432
MAX_REQUEST_BYTES=4000000
```

El archivo `.env` está ignorado por Git. Nunca lo agregues al repositorio.

Inicia la API:

```bash
npm run dev
```

La API se ejecuta en:

```text
http://localhost:4000
```

Comprueba que esté funcionando:

```bash
curl http://localhost:4000/api/health
```

Respuesta esperada:

```json
{"status":"ok"}
```

### 3. Configura el frontend

En una segunda terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Crea `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:4000
```

Inicia Vite:

```bash
npm run dev
```

Abre:

```text
http://localhost:5173
```

No coloques secretos de MongoDB, JWT o Cloudinary en variables `VITE_*`. Vite expone las variables `VITE_*` al navegador.

---

## Configuración de MongoDB Atlas

1. Crea un proyecto y un clúster de MongoDB Atlas.
2. Crea un usuario de base de datos con permisos para la base de datos de la aplicación.
3. Elige un nombre de base de datos, por ejemplo `reworn`.
4. Copia la cadena de conexión completa.
5. Agrégala a `backend/.env` como `MONGODB_URI`.

La cadena de conexión debe incluir el nombre de la base de datos:

```text
mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/reworn?retryWrites=true&w=majority
```

Para un despliegue en Vercel, Atlas debe poder recibir conexiones desde el entorno de ejecución de Vercel. Configura Atlas Network Access de acuerdo con tu despliegue y restringe el acceso tanto como sea posible según tu plan de Vercel y el diseño de tu red.

Mongoose modela las colecciones `User` y `Listing`. La API mantiene la conexión de Mongoose en caché entre invocaciones serverless que siguen calientes.

---

## Configuración de Cloudinary

1. Crea una cuenta de Cloudinary o inicia sesión.
2. Abre la configuración de API Keys de Cloudinary.
3. Copia el valor completo de `CLOUDINARY_URL`.
4. Agréguelo a `backend/.env` o a las variables de entorno del backend en Vercel.

El formato esperado es:

```text
cloudinary://<api_key>:<api_secret>@<cloud_name>
```

El backend usa únicamente `CLOUDINARY_URL` para las credenciales de Cloudinary. La carpeta de cargas está fijada en el código del backend como `secondhand-listings`.

El flujo de carga es:

1. Multer almacena temporalmente el archivo multipart en memoria.
2. El backend valida el tipo MIME y el tamaño del archivo.
3. El backend sube el buffer a Cloudinary.
4. Solo se guardan en MongoDB el `public_id` y la `secure_url` de Cloudinary.
5. Los archivos binarios de imagen y las rutas temporales nunca se guardan en MongoDB.

Los tipos de imagen compatibles son JPEG, PNG y WebP. El límite predeterminado por imagen es 768 KB y el límite total de la solicitud es aproximadamente 4 MB para no superar el límite de solicitudes de las funciones de Vercel.

---

## Archivos de entorno

Plantillas agregadas al repositorio:

```text
backend/.env.example
frontend/.env.example
```

Archivos de entorno locales:

```text
backend/.env
frontend/.env.local
```

Los archivos locales están ignorados por Git. Agrega los valores de producción directamente en la configuración de los proyectos de Vercel en lugar de agregarlos al repositorio.

---

## Rutas de la API

### Autenticación

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Anuncios

- `GET /api/listings` — catálogo público con los parámetros opcionales `search`, `category`, `size`, `condition`, `status`, `page` y `limit`
- `GET /api/listings/mine` — requiere autenticación
- `GET /api/listings/:id`
- `POST /api/listings` — requiere autenticación, `multipart/form-data`
- `PATCH /api/listings/:id` — solo el propietario
- `DELETE /api/listings/:id` — solo el propietario; establece el estado en `hidden`

Las solicitudes de creación y actualización usan el nombre de campo `images` para los archivos. El backend permite un máximo de cinco imágenes.

---

## Despliegue en Vercel

Crea dos proyectos de Vercel desde el mismo repositorio de GitHub.

| Proyecto | Directorio raíz | Preset del framework | Propósito |
|---|---|---|---|
| Backend | `backend` | Express | API |
| Frontend | `frontend` | Vite | Aplicación React |

### Configuración del proyecto backend

Utiliza:

```text
Directorio raíz: backend
Preset del framework: Express
Build command: déjalo vacío
Output directory: déjalo vacío
Install command: npm install
```

El archivo `backend/index.js` exporta la aplicación Express para Vercel. `server.js` se utiliza en los comandos locales `npm run dev` y `npm start` para escuchar en un puerto.

El backend no necesita un archivo `vercel.json` con reescrituras. Una configuración anterior que reescribía `/api/*` a `/api/index.js` enviaba las solicitudes a una ruta inexistente y producía errores como `Route not found: GET /api/index.js`. Un `backend/vercel.json` que contenga `"framework": null` también puede sobrescribir el preset Express del panel de Vercel. Si existe cualquiera de esas configuraciones, elimínala antes de desplegar.

### Variables de entorno de producción del backend

Configura estas variables en el proyecto de Vercel del backend:

```env
NODE_ENV=production
MONGODB_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
CLOUDINARY_TIMEOUT_MS=20000
CLIENT_ORIGIN=https://tu-dominio-frontend.com
COOKIE_SAME_SITE=none
MAX_IMAGE_BYTES=786432
MAX_REQUEST_BYTES=4000000
```

`CLIENT_ORIGIN` debe ser exactamente el origen del frontend, sin `/` al final ni una ruta `/api`. Puedes separar varios orígenes permitidos con comas.

### Configuración del proyecto frontend

Utiliza:

```text
Directorio raíz: frontend
Preset del framework: Vite
```

Configura la variable de producción del frontend:

```env
VITE_API_URL=https://tu-dominio-backend.com
```

Usa el origen completo del backend, incluyendo `https://`. No	configures un dominio sin protocolo, el dominio del frontend ni una ruta relativa del frontend. El frontend agrega `/api` por su cuenta.

Las variables de Vite se incorporan durante el build. Vuelve a desplegar el frontend después de cambiar `VITE_API_URL`.

`frontend/vercel.json` reescribe las rutas del lado del cliente a `index.html` para que rutas como `/my-listings` funcionen cuando se abren directamente.

### Dominios y cookies

El despliegue actual puede utilizar dominios separados de Vercel, por ejemplo:

```text
https://frontend-pec5-ecru.vercel.app
https://pec-5-api.vercel.app
```

Como son sitios separados, el backend debe usar:

```env
COOKIE_SAME_SITE=none
```

El backend establece automáticamente `Secure` cuando se usa `SameSite=None` en producción. Algunos navegadores o configuraciones de privacidad todavía pueden bloquear las cookies de terceros.

Para que las cookies funcionen de manera más confiable, utiliza subdominios de un mismo dominio principal:

```text
https://shop.example.com
https://api.example.com
```

Con esa configuración utiliza:

```env
CLIENT_ORIGIN=https://shop.example.com
COOKIE_SAME_SITE=lax
```

El frontend ya envía `credentials: "include"`. El backend permite exactamente los orígenes configurados y no utiliza CORS con comodín junto con credenciales.

Para un despliegue público en internet, agrega protección CSRF antes de depender de cookies entre sitios. CORS controla qué orígenes pueden leer las respuestas, pero por sí solo no es una defensa completa contra CSRF.

### Verifica un despliegue

Verifica siempre primero directamente el backend:

```bash
curl -i https://tu-dominio-backend.com/api/health
```

Respuesta esperada:

```json
{"status":"ok"}
```

Después verifica CORS:

```bash
curl -i -X OPTIONS "https://tu-dominio-backend.com/api/auth/login" \
  -H "Origin: https://tu-dominio-frontend.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

La respuesta debería incluir:

```text
Access-Control-Allow-Origin: https://tu-dominio-frontend.com
Access-Control-Allow-Credentials: true
```

Después de cambiar la configuración de Vercel o las variables de entorno, crea un nuevo despliegue. El despliegue de producción existente no cambia retroactivamente.

---

## Problemas comunes de despliegue

### JavaScript sin procesar o `NOT_FOUND` en el dominio del backend

La solicitud está llegando a un proyecto estático de Vercel o al directorio raíz equivocado. Confirma que el dominio del backend esté asociado al proyecto cuyo directorio raíz sea `backend` y cuyo preset sea Express.

### `405 Method Not Allowed`

Probablemente la URL de la API del frontend apunta al dominio del frontend, cuya reescritura de la SPA está manejando la solicitud. Confirma que `VITE_API_URL` contenga el origen del backend.

### Error de CORS sin `Access-Control-Allow-Origin`

Comprueba que `CLIENT_ORIGIN` coincida exactamente con el encabezado `Origin` del navegador, que esté configurado en el entorno de producción del backend y que el backend se haya vuelto a desplegar.

### El inicio de sesión funciona pero las rutas protegidas devuelven `401`

La respuesta del inicio de sesión puede completar el estado de React aunque el navegador no envíe la cookie en solicitudes posteriores entre sitios. Cuando utilices dominios separados de Vercel, inspecciona que la respuesta de login incluya `SameSite=None` y confirma que `/api/listings/mine` tenga un encabezado de solicitud `Cookie`.

---

## Comandos útiles

```bash
# Backend
cd backend
npm run dev
npm test
node --check server.js

# Frontend
cd frontend
npm run dev
npm run lint
npm run build
```

---

## Desarrollo asistido por IA

Se utilizaron herramientas de IA durante el diseño, la implementación y la depuración de este proyecto. El trabajo fue colaborativo: el usuario tomó las decisiones de producto y despliegue, mientras que la IA ayudó a convertir esas decisiones en código, pruebas, documentación y pasos de solución de problemas.

El usuario guió varias decisiones importantes:

- Eligió React, Node.js, Express, MongoDB y Mongoose para el stack.
- Eligió un modelo de marketplace comunitario en lugar de una tienda de un solo vendedor.
- Eligió el encriptado de contraseñas con bcrypt y la autenticación JWT.
- Eligió cookies HTTP-only en lugar de guardar tokens en el almacenamiento del navegador.
- Restringió la edición y eliminación de anuncios al propietario de cada anuncio.
- Eligió Cloudinary para alojar imágenes y MongoDB para guardar los metadatos de las imágenes.
- Limitó los anuncios a entre una y cinco imágenes.
- Eligió la eliminación lógica con el estado `hidden` en lugar de la eliminación permanente.
- Eligió React Router y estilos responsive con Tailwind para el frontend.
- Eligió dos proyectos separados de Vercel para el frontend y el backend.
- Eligió `CLOUDINARY_URL` en lugar de variables separadas para las credenciales de Cloudinary.
- Eligió mantener los dominios predeterminados de Vercel y usar cookies `SameSite=None` en el despliegue actual.

La IA ayudó con la implementación de los modelos de Mongoose, el middleware de autenticación, las comprobaciones de propiedad, las cargas multipart, la integración con Cloudinary, las páginas React responsive, la validación de la API y las pruebas automatizadas. También ayudó a diagnosticar varios problemas de integración, entre ellos que Vercel mostrara archivos fuente en lugar de ejecutar la API, una configuración incorrecta de `VITE_API_URL`, errores de preflight CORS, el comportamiento de cookies entre sitios, la configuración de cargas de Cloudinary y el comportamiento de la vista previa de imágenes en el navegador.

El usuario probó cada paso del despliegue en el entorno real de Vercel, informó los errores observados y ajustó la configuración. La IA proporcionó los cambios de código y las explicaciones de depuración, pero el usuario conservó el control de las decisiones de producto, las credenciales, la configuración de Vercel y las decisiones finales del despliegue.


-----


# Reworn - English Documentation

Reworn is a small fullstack secondhand clothing marketplace. It is built with React, Vite, Tailwind CSS, Express, MongoDB/Mongoose, JWT authentication, and Cloudinary.

The application is split into two independently deployable projects:

```text
PEC5/
├── backend/   Express API, Mongoose models, authentication, and uploads
├── frontend/  Vite React application
└── README.md
```

## Features

- Public clothing catalog with search, category, size, and condition filters
- User registration and login
- Password hashing with `bcryptjs`
- JWT authentication stored in an HTTP-only cookie
- Users can create listings and edit, mark sold, or hide only their own listings
- Listings support 1–5 Cloudinary-hosted images
- Soft deletion through `status: "hidden"`
- Responsive Tailwind interface with React Router navigation
- Separate Vercel deployments for the frontend and backend

---

## Local installation

### Requirements

Install:

- Node.js 20 or newer
- npm
- A MongoDB Atlas cluster or local MongoDB instance
- A Cloudinary account

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd PEC5
```

### 2. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and add your values:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=7d
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
CLOUDINARY_TIMEOUT_MS=20000
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
COOKIE_SAME_SITE=lax
MAX_IMAGE_BYTES=786432
MAX_REQUEST_BYTES=4000000
```

The `.env` file is ignored by Git. Never commit it.

Start the API:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:4000
```

Check that it is running:

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{"status":"ok"}
```

### 3. Configure the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:4000
```

Start Vite:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Do not put MongoDB, JWT, or Cloudinary secrets in a `VITE_*` variable. Vite exposes `VITE_*` variables to the browser.

---

## MongoDB Atlas setup

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with permissions for the application database.
3. Choose a database name, such as `reworn`.
4. Copy the full connection string.
5. Add it to `backend/.env` as `MONGODB_URI`.

The connection string should include the database name:

```text
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/reworn?retryWrites=true&w=majority
```

For a Vercel deployment, Atlas must be able to receive connections from the Vercel runtime. Configure Atlas Network Access appropriately for your deployment. Restrict access as much as your Vercel plan and network design allow.

Mongoose models the `User` and `Listing` collections. The API caches its Mongoose connection between warm serverless invocations.

---

## Cloudinary setup

1. Create or sign in to a Cloudinary account.
2. Open the Cloudinary API Keys settings.
3. Copy the complete `CLOUDINARY_URL` value.
4. Add it to `backend/.env` or the backend Vercel environment variables.

The expected format is:

```text
cloudinary://<api_key>:<api_secret>@<cloud_name>
```

The backend only uses `CLOUDINARY_URL` for Cloudinary credentials. The upload folder is fixed in the backend code as `secondhand-listings`.

The upload flow is:

1. Multer stores the multipart file temporarily in memory.
2. The backend validates the MIME type and file size.
3. The backend uploads the buffer to Cloudinary.
4. Only the Cloudinary `public_id` and `secure_url` are stored in MongoDB.
5. Image binaries and temporary file paths are never stored in MongoDB.

Supported image types are JPEG, PNG, and WebP. The default per-image limit is 768 KB, and the total request limit is approximately 4 MB to remain below Vercel’s function request limit.

---

## Environment files

Committed templates:

```text
backend/.env.example
frontend/.env.example
```

Local environment files:

```text
backend/.env
frontend/.env.local
```

The local files are ignored by Git. Add production values directly in the Vercel project settings rather than committing them.

---

## API routes

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Listings

- `GET /api/listings` — public catalog with optional `search`, `category`, `size`, `condition`, `status`, `page`, and `limit` query parameters
- `GET /api/listings/mine` — authenticated
- `GET /api/listings/:id`
- `POST /api/listings` — authenticated, `multipart/form-data`
- `PATCH /api/listings/:id` — owner only
- `DELETE /api/listings/:id` — owner only; sets status to `hidden`

Create and update requests use the field name `images` for files. The backend enforces a maximum of five images.

---

## Vercel deployment

Create two Vercel projects from the same GitHub repository.

| Project | Root directory | Framework preset | Purpose |
|---|---|---|---|
| Backend | `backend` | Express | API |
| Frontend | `frontend` | Vite | React application |

### Backend project settings

Use:

```text
Root directory: backend
Framework preset: Express
Build command: leave blank
Output directory: leave blank
Install command: npm install
```

The backend `index.js` exports the Express application for Vercel. `server.js` is used by the local `npm run dev`/`npm start` commands to listen on a port.

The backend does not need a `vercel.json` rewrite file. A previous configuration that rewrote `/api/*` to `/api/index.js` caused requests to be sent to a non-existent path and produced errors such as `Route not found: GET /api/index.js`. A backend `vercel.json` containing `"framework": null` can also override the Express preset in the dashboard. If either configuration exists, remove it before deploying.

### Backend Production environment variables

Set these in the backend Vercel project:

```env
NODE_ENV=production
MONGODB_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
CLOUDINARY_TIMEOUT_MS=20000
CLIENT_ORIGIN=https://your-frontend-domain.com
COOKIE_SAME_SITE=none
MAX_IMAGE_BYTES=786432
MAX_REQUEST_BYTES=4000000
```

`CLIENT_ORIGIN` must be the exact frontend origin, without a trailing slash or `/api` path. Multiple allowed origins can be separated with commas.

### Frontend project settings

Use:

```text
Root directory: frontend
Framework preset: Vite
```

Set the frontend Production variable:

```env
VITE_API_URL=https://your-backend-domain.com
```

Use the complete backend origin, including `https://`. Do not set a bare domain, the frontend domain, or a frontend-relative path. The frontend adds `/api` to the URL itself.

Vite variables are embedded at build time. Redeploy the frontend after changing `VITE_API_URL`.

`frontend/vercel.json` rewrites client-side routes to `index.html` so routes such as `/my-listings` work when opened directly.

### Domains and cookies

The current deployment can use separate Vercel domains, for example:

```text
https://frontend-pec5-ecru.vercel.app
https://pec-5-api.vercel.app
```

Because these are separate sites, the backend must use:

```env
COOKIE_SAME_SITE=none
```

The backend automatically sets `Secure` when `SameSite=None` is used in production. Some browsers or privacy settings can still block third-party cookies.

For the most reliable cookie behavior, use subdomains under one parent domain:

```text
https://shop.example.com
https://api.example.com
```

With that setup, use:

```env
CLIENT_ORIGIN=https://shop.example.com
COOKIE_SAME_SITE=lax
```

The frontend already sends `credentials: "include"`. The backend allows the exact configured origins and does not use wildcard CORS with credentials.

For a public internet deployment, add CSRF protection before relying on cross-site cookies. CORS controls which origins may read responses, but it is not by itself a complete CSRF defense.

### Verify a deployment

Always verify the backend directly first:

```bash
curl -i https://your-backend-domain.com/api/health
```

Expected response:

```json
{"status":"ok"}
```

Then verify CORS:

```bash
curl -i -X OPTIONS "https://your-backend-domain.com/api/auth/login" \
  -H "Origin: https://your-frontend-domain.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

The response should include:

```text
Access-Control-Allow-Origin: https://your-frontend-domain.com
Access-Control-Allow-Credentials: true
```

After changing Vercel settings or environment variables, create a new deployment. The existing Production deployment does not change retroactively.

---

## Common deployment problems

### Raw JavaScript or `NOT_FOUND` at the backend domain

The request is hitting a static Vercel project or the wrong project root. Confirm that the backend domain is attached to the project whose root directory is `backend` and whose framework preset is Express.

### `405 Method Not Allowed`

The frontend API URL is probably pointing at the frontend domain, whose SPA rewrite is handling the request. Confirm that `VITE_API_URL` contains the backend origin.

### CORS error with no `Access-Control-Allow-Origin`

Check that `CLIENT_ORIGIN` exactly matches the browser’s `Origin` header, that it is set in the backend Production environment, and that the backend was redeployed.

### Login succeeds but protected routes return `401`

The login response can populate React state even when the browser does not send the cookie on later cross-site requests. Inspect the login response for `SameSite=None` when using separate Vercel domains, and confirm that `/api/listings/mine` has a `Cookie` request header.

---

## Useful commands

```bash
# Backend
cd backend
npm run dev
npm test
node --check server.js

# Frontend
cd frontend
npm run dev
npm run lint
npm run build
```

---

## AI-assisted development

AI tools were used throughout the design, implementation, and debugging of this project. The work was collaborative: the user made the product and deployment decisions, while the AI helped translate those decisions into code, tests, documentation, and troubleshooting steps.

The user guided several important choices:

- Chose React, Node.js, Express, MongoDB, and Mongoose for the stack.
- Chose a community-marketplace model rather than a single-seller store.
- Chose bcrypt password hashing and JWT authentication.
- Chose HTTP-only cookies instead of storing tokens in browser storage.
- Restricted listing edits and deletion to the listing owner.
- Chose Cloudinary for image hosting and MongoDB for image metadata.
- Limited listings to one through five images.
- Chose soft deletion with a `hidden` status instead of permanent deletion.
- Chose React Router and responsive Tailwind styling for the frontend.
- Chose separate Vercel projects for the frontend and backend.
- Chose `CLOUDINARY_URL` instead of separate Cloudinary credential variables.
- Chose to keep the default Vercel domains and use `SameSite=None` cookies for the current deployment.

The AI helped with the implementation of the Mongoose models, authentication middleware, ownership checks, multipart uploads, Cloudinary integration, responsive React pages, API validation, and automated tests. It also helped diagnose several integration problems, including Vercel returning source files instead of running the API, incorrect API URL configuration, CORS preflight failures, cross-site cookie behavior, Cloudinary upload configuration, and browser image-preview behavior.

The user tested each deployment step in the real Vercel environment, reported the observed errors, and adjusted the deployment configuration. The AI provided the code changes and debugging explanations, but the user retained control of the product decisions, credentials, Vercel settings, and final deployment choices.
