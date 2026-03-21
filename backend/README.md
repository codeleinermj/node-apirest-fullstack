# API REST Node.js

API REST profesional construida con Node.js, Express, TypeScript y Prisma. Implementa autenticacion JWT, roles de usuario, CRUD de productos y documentacion Swagger.

---

## Tabla de Contenidos

- [Descripcion General](#descripcion-general)
- [Stack Tecnologico](#stack-tecnologico)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion](#instalacion)
- [Variables de Entorno](#variables-de-entorno)
- [Base de Datos](#base-de-datos)
- [Ejecucion](#ejecucion)
- [Docker](#docker)
- [Endpoints de la API](#endpoints-de-la-api)
- [Autenticacion](#autenticacion)
- [Formato de Respuestas](#formato-de-respuestas)
- [Codigos de Error](#codigos-de-error)
- [Validacion de Datos](#validacion-de-datos)
- [Middlewares](#middlewares)
- [Logging](#logging)
- [Seguridad](#seguridad)
- [Seed de Datos](#seed-de-datos)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Scripts Disponibles](#scripts-disponibles)
- [Licencia](#licencia)

---

## Descripcion General

API REST con arquitectura en capas (Layered Architecture + Service Pattern) que provee:

- **Autenticacion** con JWT (access token + refresh token)
- **Autorizacion** basada en roles (`ADMIN`, `USER`)
- **CRUD de usuarios** con soft delete (campo `active`) y paginacion
- **CRUD de productos** con paginacion, filtrado por precio, busqueda por texto y ordenamiento
- **Documentacion interactiva** con Swagger UI (OpenAPI 3.0)
- **Respuestas estandarizadas** en toda la API
- **Manejo centralizado de errores** con clase `ApiError`
- **Logging estructurado** con Pino (+ pino-pretty en desarrollo)
- **Validacion de datos** con Zod en cada ruta
- **Seguridad** con Helmet, CORS y limite de body (10MB)
- **Compresion** de respuestas con gzip (compression)
- **Graceful shutdown** con manejo de SIGINT/SIGTERM
- **Health check** endpoint
- **Entorno reproducible** con Docker (multi-stage build)

---

## Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Runtime | Node.js | 20 LTS |
| Framework | Express | 5.x |
| Lenguaje | TypeScript | 5.x (strict mode) |
| ORM | Prisma | 5.x |
| Base de datos | PostgreSQL | 16 (Alpine) |
| Validacion | Zod | 4.x |
| Autenticacion | jsonwebtoken | 9.x |
| Hash de passwords | bcrypt | 6.x |
| Logger | Pino + pino-pretty | 10.x |
| Seguridad HTTP | Helmet | 8.x |
| Compresion | compression | 1.x |
| CORS | cors | 2.x |
| Documentacion | swagger-jsdoc + swagger-ui-express | 6.x / 5.x |
| Testing | Vitest + Supertest | 4.x / 7.x |
| Test de estres | k6 | - |
| Contenedores | Docker + Docker Compose | - |
| CI/CD | GitHub Actions | - |
| Linter | ESLint + Prettier | 10.x / 3.x |

---

## Arquitectura

El proyecto sigue una **Layered Architecture (3 capas)** con **Service Pattern**:

```
Client
  |  HTTP Request
  v
Router        -->  Define rutas y aplica middlewares
  |
Middleware    -->  Helmet, CORS, Compression, Auth guard, validacion Zod
  |
Controller   -->  Parsea request, llama al service, responde con ApiResponse
  |
Service       -->  Logica de negocio, permisos, validacion de existencia
  |
Prisma ORM   -->  Queries type-safe a SQL
  |
PostgreSQL   -->  Base de datos
```

### Por que esta arquitectura

- **Single Responsibility**: cada capa tiene exactamente una responsabilidad
- **Testabilidad**: los services se testean sin levantar HTTP
- **Reemplazabilidad**: cambiar el ORM implica tocar solo la capa de datos
- **Pragmatismo**: cero abstracciones innecesarias

---

## Estructura del Proyecto

```
backend/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Pipeline CI/CD (lint, build, test, docker)
├── prisma/
│   ├── schema.prisma               # Modelo de datos (User, Product)
│   ├── seed.ts                     # Datos iniciales (admin + user + 3 productos)
│   ├── seed-stress.ts              # Seed para tests de estres (5000 productos)
│   └── migrations/                 # Migraciones generadas por Prisma
├── src/
│   ├── config/
│   │   ├── env.ts                  # Validacion de env vars con Zod
│   │   └── swagger.ts              # Configuracion de Swagger/OpenAPI 3.0
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts  # Controlador: register, login, refresh
│   │   │   ├── auth.service.ts     # Servicio: hash, JWT, verificacion
│   │   │   ├── auth.schema.ts      # Zod schemas + tipos exportados
│   │   │   └── auth.routes.ts      # Rutas + Swagger JSDoc
│   │   ├── user/
│   │   │   ├── user.controller.ts  # Controlador: findAll, findById, update, delete
│   │   │   ├── user.service.ts     # Servicio: queries, permisos owner/admin, soft delete
│   │   │   ├── user.schema.ts      # Zod schemas (getUsers, getById, update, delete)
│   │   │   └── user.routes.ts      # Rutas + Swagger JSDoc
│   │   └── product/
│   │       ├── product.controller.ts # Controlador: create, findAll, findById, update, delete
│   │       ├── product.service.ts    # Servicio: CRUD, filtrado, paginacion, permisos
│   │       ├── product.schema.ts     # Zod schemas (create, update, getAll, getById)
│   │       └── product.routes.ts     # Rutas + Swagger JSDoc
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── authenticate.ts     # Verifica JWT y extrae userId/userRole
│   │   │   ├── authorize.ts        # Verifica que el rol este en la lista permitida
│   │   │   ├── validate.ts         # Valida body/query/params con Zod
│   │   │   └── error-handler.ts    # Manejo centralizado: ApiError -> JSON response
│   │   ├── utils/
│   │   │   ├── api-response.ts     # Clase estatica: success(), paginated(), error()
│   │   │   ├── api-error.ts        # Clase de error: badRequest, unauthorized, forbidden, notFound, conflict, internal
│   │   │   └── logger.ts           # Pino logger (silent en test, pino-pretty en dev)
│   │   └── types/
│   │       └── index.ts            # JwtPayload, RefreshTokenPayload, PaginationQuery, Express.Request augment
│   ├── database/
│   │   └── prisma.ts               # Instancia singleton de PrismaClient
│   ├── app.ts                      # Configuracion de Express (middlewares, rutas, swagger, health check)
│   └── server.ts                   # Entry point (connect DB, listen, graceful shutdown)
├── tests/
│   ├── unit/
│   │   ├── auth.service.test.ts    # Tests unitarios del AuthService
│   │   └── product.service.test.ts # Tests unitarios del ProductService
│   ├── integration/
│   │   ├── auth.test.ts            # Tests de integracion del flujo de auth
│   │   └── product.test.ts         # Tests de integracion del flujo de productos
│   ├── stress/
│   │   └── load-test.js            # Script k6 de carga sobre GET /api/products
│   └── setup.ts                    # Variables de entorno para test (NODE_ENV=test, port 3001)
├── docker-compose.yml              # Servicios: db (postgres:16-alpine) + app
├── Dockerfile                      # Multi-stage: build con tsc + produccion slim
├── .env.example                    # Plantilla de variables de entorno
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
└── package.json
```

---

## Requisitos Previos

- **Node.js** >= 20
- **npm** >= 9
- **Docker** y **Docker Compose** (para la base de datos o entorno completo)
- **PostgreSQL 16** (si se ejecuta sin Docker)

---

## Instalacion

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd backend

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores (especialmente los JWT secrets)

# 4. Levantar la base de datos con Docker
docker compose up -d db

# 5. Ejecutar migraciones de Prisma
npm run prisma:migrate

# 6. Generar el cliente de Prisma
npm run prisma:generate

# 7. (Opcional) Cargar datos iniciales
npm run prisma:seed
```

---

## Variables de Entorno

Crear un archivo `.env` en la raiz del proyecto basandose en `.env.example`:

| Variable | Descripcion | Ejemplo | Requerida |
|----------|-------------|---------|-----------|
| `NODE_ENV` | Entorno de ejecucion (`development`, `production`, `test`) | `development` | No (default: `development`) |
| `PORT` | Puerto del servidor | `3000` | No (default: `3000`) |
| `DATABASE_URL` | URL de conexion a PostgreSQL | `postgresql://api_user:api_password@localhost:5432/api_db` | Si |
| `JWT_ACCESS_SECRET` | Secreto para firmar access tokens | `your-access-secret-min-32-chars` | Si (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens | `your-refresh-secret-min-32-chars` | Si (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | Duracion del access token | `15m` | No (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Duracion del refresh token | `7d` | No (default: `7d`) |
| `BCRYPT_SALT_ROUNDS` | Rondas de salt para bcrypt (4-16) | `10` | No (default: `10`) |

> Las variables de entorno se validan al arrancar la aplicacion usando Zod (`src/config/env.ts`). Si falta alguna variable requerida o tiene un formato invalido, la aplicacion no iniciara y mostrara los errores por consola.

---

## Base de Datos

### Modelo de Datos

La API utiliza dos entidades principales mapeadas a tablas `users` y `products`:

**User** (tabla: `users`)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico (auto-generado) |
| `email` | String (unique) | Correo electronico |
| `password` | String | Password hasheado con bcrypt |
| `name` | String | Nombre del usuario |
| `role` | Enum (`USER`, `ADMIN`) | Rol del usuario (default: `USER`) |
| `active` | Boolean | Indica si el usuario esta activo (default: `true`). Se usa para soft delete |
| `createdAt` | DateTime | Fecha de creacion (auto) |
| `updatedAt` | DateTime | Fecha de ultima actualizacion (auto) |

**Product** (tabla: `products`)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico (auto-generado) |
| `title` | String | Titulo del producto |
| `description` | String (opcional) | Descripcion del producto |
| `price` | Float | Precio (indexado para queries de rango) |
| `stock` | Int | Stock disponible (default: `0`) |
| `authorId` | UUID (FK) | ID del usuario que creo el producto (indexado) |
| `createdAt` | DateTime | Fecha de creacion (auto) |
| `updatedAt` | DateTime | Fecha de ultima actualizacion (auto) |

### Relaciones

- Un **User** puede tener muchos **Products** (1:N)
- Al eliminar un User, se eliminan sus Products en cascada (`onDelete: Cascade`)

### Indices

- `products.author_id` - indice para queries por autor
- `products.price` - indice para queries de rango de precios

---

## Ejecucion

### Desarrollo

```bash
npm run dev
```

La aplicacion se inicia en modo watch con `tsx` y se reinicia automaticamente ante cambios. El logger usa `pino-pretty` para output formateado con colores.

### Produccion

```bash
npm run build
npm start
```

En produccion el logger usa formato JSON nativo de Pino (sin pino-pretty).

### URL base

```
http://localhost:3000
```

---

## Docker

### Levantar todo el entorno

```bash
docker compose up
```

Esto levanta:
- **app**: Servidor Node.js en el puerto `3000` (ejecuta migraciones automaticamente al iniciar)
- **db**: PostgreSQL 16 Alpine en el puerto `5432` con volumen persistente `pgdata`

### Solo la base de datos

```bash
docker compose up -d db
```

### Dockerfile (Multi-stage)

- **Stage 1 (Build)**: `node:20-alpine`, instala dependencias, genera Prisma client y compila TypeScript
- **Stage 2 (Production)**: `node:20-alpine`, instala solo dependencias de produccion (`npm ci --omit=dev`), copia `dist/` y ejecuta migraciones + server

El CMD del contenedor ejecuta `npx prisma migrate deploy && node dist/server.js`, asegurando que la base de datos este actualizada antes de arrancar.

---

## Endpoints de la API

### Documentacion Interactiva

La documentacion Swagger (OpenAPI 3.0) esta disponible en:

```
GET /api/docs
```

### Health Check

```
GET /api/health
```

Respuesta:
```json
{
  "success": true,
  "data": { "status": "ok" }
}
```

### Auth `/api/auth`

| Metodo | Ruta | Descripcion | Autenticacion |
|--------|------|-------------|---------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | No requiere |
| `POST` | `/api/auth/login` | Iniciar sesion (retorna tokens + datos de usuario) | No requiere |
| `POST` | `/api/auth/refresh` | Renovar par de tokens | Refresh Token en body |

#### `POST /api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

Validaciones:
- `email`: formato email valido (requerido)
- `password`: minimo 6 caracteres (requerido)
- `name`: minimo 1 caracter (requerido)

**Respuesta 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2026-03-20T..."
  }
}
```

**Errores:** `409 CONFLICT` si el email ya esta registrado.

#### `POST /api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

**Errores:** `401 UNAUTHORIZED` si las credenciales son invalidas o el usuario esta desactivado.

#### `POST /api/auth/refresh`

**Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Errores:** `401 UNAUTHORIZED` si el refresh token es invalido, expirado o el usuario esta desactivado.

---

### Users `/api/users`

| Metodo | Ruta | Descripcion | Autenticacion |
|--------|------|-------------|---------------|
| `GET` | `/api/users` | Listar usuarios activos (paginado) | ADMIN |
| `GET` | `/api/users/:id` | Obtener usuario por ID | Autenticado |
| `PATCH` | `/api/users/:id` | Actualizar usuario | Autenticado (owner o ADMIN) |
| `DELETE` | `/api/users/:id` | Eliminar usuario (soft delete: `active = false`) | ADMIN |

#### `GET /api/users`

**Query params:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `page` | number | `1` | Pagina (min: 1) |
| `limit` | number | `10` | Resultados por pagina (min: 1, max: 100) |

Solo retorna usuarios con `active = true`.

#### `GET /api/users/:id`

El parametro `id` debe ser un UUID valido.

#### `PATCH /api/users/:id`

**Body (todos opcionales):**
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@email.com"
}
```

- Solo el propio usuario o un ADMIN pueden actualizar el perfil
- Si se cambia el email, se verifica que no este en uso por otro usuario

#### `DELETE /api/users/:id`

Realiza un **soft delete**: cambia `active` a `false`. No elimina el registro de la base de datos.

---

### Products `/api/products`

| Metodo | Ruta | Descripcion | Autenticacion |
|--------|------|-------------|---------------|
| `GET` | `/api/products` | Listar productos (paginado, filtrado, ordenamiento) | No requiere |
| `GET` | `/api/products/:id` | Obtener producto por ID (incluye datos del autor) | No requiere |
| `POST` | `/api/products` | Crear producto | Autenticado |
| `PATCH` | `/api/products/:id` | Actualizar producto | Autenticado (owner o ADMIN) |
| `DELETE` | `/api/products/:id` | Eliminar producto (hard delete) | Autenticado (owner o ADMIN) |

#### `GET /api/products`

**Query params:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `page` | number | `1` | Pagina (min: 1) |
| `limit` | number | `10` | Resultados por pagina (min: 1, max: 100) |
| `sortBy` | string | `createdAt` | Campo de ordenamiento: `price`, `title`, `createdAt` |
| `order` | string | `desc` | Direccion: `asc`, `desc` |
| `minPrice` | number | - | Precio minimo (filtro `>=`) |
| `maxPrice` | number | - | Precio maximo (filtro `<=`) |
| `search` | string | - | Busqueda por titulo o descripcion (case insensitive, `contains`) |

**Ejemplo:**
```
GET /api/products?page=1&limit=5&sortBy=price&order=asc&minPrice=10&maxPrice=100&search=laptop
```

#### `POST /api/products`

**Body:**
```json
{
  "title": "Laptop Pro 15",
  "description": "Laptop de alto rendimiento",
  "price": 1299.99,
  "stock": 25
}
```

Validaciones:
- `title`: requerido (min 1 caracter)
- `description`: opcional
- `price`: requerido, debe ser positivo
- `stock`: opcional (default: `0`), entero >= 0

El `authorId` se asigna automaticamente del JWT del usuario autenticado.

#### `PATCH /api/products/:id`

**Body (todos opcionales):**
```json
{
  "title": "Nuevo titulo",
  "description": "Nueva descripcion",
  "price": 999.99,
  "stock": 10
}
```

Solo el autor del producto o un ADMIN pueden actualizarlo.

#### `DELETE /api/products/:id`

Realiza un **hard delete**: elimina el registro de la base de datos permanentemente. Solo el autor del producto o un ADMIN pueden eliminarlo.

---

## Autenticacion

La API utiliza **JWT (JSON Web Tokens)** con estrategia de doble token:

### Access Token
- **Duracion**: 15 minutos (configurable via `JWT_ACCESS_EXPIRES_IN`)
- **Ubicacion**: Header `Authorization: Bearer <token>`
- **Payload**: `{ sub: userId, role: Role }`
- **Uso**: Autenticar cada request protegida

### Refresh Token
- **Duracion**: 7 dias (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Ubicacion**: Body en `POST /api/auth/refresh`
- **Payload**: `{ sub: userId, type: 'refresh' }`
- **Uso**: Obtener un nuevo par de tokens sin re-login

### Flujo de Autenticacion

```
1. POST /api/auth/register  -->  Crea usuario, retorna datos (sin tokens)
2. POST /api/auth/login     -->  { accessToken, refreshToken, user }
3. Requests protegidas:      Authorization: Bearer <accessToken>
4. Cuando el access token expira  -->  POST /api/auth/refresh { refreshToken }
5. Se recibe un nuevo par de tokens (ambos se renuevan)
```

### Ejemplo de uso

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123", "name": "John Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123"}'

# Request autenticada
curl http://localhost:3000/api/users/<user-id> \
  -H "Authorization: Bearer <access_token>"

# Refrescar token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'

# Health check
curl http://localhost:3000/api/health
```

---

## Formato de Respuestas

Todas las respuestas siguen un formato estandar a traves de la clase `ApiResponse`:

### Respuesta exitosa

```json
{
  "success": true,
  "data": { ... }
}
```

### Respuesta exitosa paginada

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

> El campo `meta` solo se incluye en respuestas paginadas (listado de usuarios y productos).

### Respuesta de error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son validos",
    "details": [
      {
        "field": "body.email",
        "message": "Formato de email invalido"
      }
    ]
  }
}
```

> El campo `details` solo se incluye en errores de validacion.

---

## Codigos de Error

| HTTP Status | Codigo | Descripcion | Cuando ocurre |
|-------------|--------|-------------|---------------|
| 400 | `VALIDATION_ERROR` | Datos de entrada invalidos | Falla la validacion Zod de body/query/params |
| 401 | `UNAUTHORIZED` | Token ausente o invalido | JWT faltante, expirado o invalido; credenciales incorrectas |
| 403 | `FORBIDDEN` | Sin permisos para el recurso | Rol insuficiente o no es owner del recurso |
| 404 | `NOT_FOUND` | Recurso no encontrado | Usuario/producto no existe o esta desactivado |
| 409 | `CONFLICT` | Recurso duplicado | Email ya registrado o ya en uso |
| 500 | `INTERNAL_ERROR` | Error interno del servidor | Error no manejado (se loguea con Pino) |

---

## Validacion de Datos

Cada ruta usa un Zod schema que valida `body`, `query` y `params` a traves del middleware `validate`:

```
Request --> validate(schema) --> Si OK, pasa al controller
                             --> Si falla, 400 VALIDATION_ERROR con details
```

### Schemas por modulo

**Auth:**
- `registerSchema`: body con `email` (email), `password` (min 6), `name` (min 1)
- `loginSchema`: body con `email` (email), `password` (min 1)
- `refreshSchema`: body con `refreshToken` (min 1)

**Users:**
- `getUsersSchema`: query con `page` (min 1) y `limit` (1-100)
- `getUserByIdSchema`: params con `id` (uuid)
- `updateUserSchema`: params con `id` (uuid), body con `name` y `email` opcionales
- `deleteUserSchema`: params con `id` (uuid)

**Products:**
- `createProductSchema`: body con `title` (min 1), `description` (opcional), `price` (positivo), `stock` (int >= 0, default 0)
- `updateProductSchema`: params con `id` (uuid), body con `title`, `description`, `price`, `stock` todos opcionales
- `getProductsSchema`: query con `page`, `limit`, `sortBy`, `order`, `minPrice`, `maxPrice`, `search`
- `getProductByIdSchema`: params con `id` (uuid)

---

## Middlewares

La aplicacion aplica middlewares en este orden en `app.ts`:

1. **Helmet** - Headers de seguridad HTTP
2. **CORS** - Cross-Origin Resource Sharing habilitado
3. **Compression** - Compresion gzip de respuestas
4. **express.json** - Parseo de JSON con limite de 10MB
5. **Request logging** - Log de cada request entrante (metodo + url) via Pino

Middlewares disponibles para rutas:

| Middleware | Archivo | Descripcion |
|------------|---------|-------------|
| `authenticate` | `shared/middlewares/authenticate.ts` | Extrae y verifica el JWT del header `Authorization: Bearer`. Inyecta `req.userId` y `req.userRole` |
| `authorize(...roles)` | `shared/middlewares/authorize.ts` | Verifica que `req.userRole` este en la lista de roles permitidos |
| `validate(schema)` | `shared/middlewares/validate.ts` | Valida `{ body, query, params }` contra un Zod schema. Retorna 400 con detalle de errores |
| `errorHandler` | `shared/middlewares/error-handler.ts` | Ultimo middleware. Convierte `ApiError` a respuesta JSON, loguea errores no manejados |

---

## Logging

El logger utiliza **Pino** configurado en `src/shared/utils/logger.ts`:

| Entorno | Nivel | Formato |
|---------|-------|---------|
| `development` | `info` | pino-pretty con colores |
| `production` | `info` | JSON nativo (ideal para sistemas de logs) |
| `test` | `silent` | Sin output |

Se registra:
- Cada request entrante (metodo + URL)
- Errores no manejados (con stack trace)
- Conexion a base de datos
- Inicio del servidor

---

## Seguridad

- **Helmet**: configura headers de seguridad (X-Content-Type-Options, X-Frame-Options, etc.)
- **CORS**: habilitado con configuracion por defecto (todos los origenes)
- **bcrypt**: passwords hasheados con salt rounds configurables (4-16, default 10)
- **JWT**: tokens firmados con secretos de minimo 32 caracteres
- **Validacion Zod**: todos los inputs se validan antes de procesarse
- **Body limit**: maximo 10MB por request
- **Soft delete de usuarios**: los usuarios desactivados no pueden hacer login ni refresh
- **Permisos por recurso**: owner o ADMIN para modificar/eliminar

---

## Seed de Datos

### Seed basico

```bash
npm run prisma:seed
```

Crea:
- **Admin**: `admin@example.com` / `admin123` (rol: ADMIN)
- **User**: `user@example.com` / `user123` (rol: USER)
- **3 productos**: Laptop Pro 15, Mouse Inalambrico, Teclado Mecanico RGB

### Seed para tests de estres

```bash
npx tsx prisma/seed-stress.ts
```

Crea:
- **Stress Tester**: `stress@test.com` / `stress123` (rol: USER)
- **5000 productos** aleatorios insertados en lotes de 500

---

## Testing

### Ejecutar tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

### Configuracion de tests

Los tests usan un setup global (`tests/setup.ts`) que configura variables de entorno para test:
- `NODE_ENV=test`, puerto `3001`
- Base de datos de test: `api_db_test`
- `BCRYPT_SALT_ROUNDS=4` (rapido para tests)
- Secrets de JWT dedicados para test

### Tipos de tests

| Tipo | Herramienta | Alcance | Ubicacion |
|------|------------|---------|-----------|
| Unitario | Vitest | Services (logica de negocio) | `tests/unit/` |
| Integracion | Vitest + Supertest | Flujo HTTP completo | `tests/integration/` |
| Estres | k6 | API completa bajo carga | `tests/stress/` |

### Tests unitarios

Se testea cada service mockeando Prisma:

- **auth.service.test.ts**: registro, login, refresh token, manejo de errores
- **product.service.test.ts**: CRUD, paginacion, permisos de owner/admin

### Tests de integracion

Flujo completo HTTP contra base de datos de test (requiere PostgreSQL corriendo):

- **auth.test.ts**: registro -> login -> tokens -> refresh -> flujos de error
- **product.test.ts**: crear con auth -> listar -> filtrar -> actualizar como owner -> permisos -> eliminar

### Test de estres (k6)

```bash
# Primero cargar datos de estres
npx tsx prisma/seed-stress.ts

# Ejecutar test de carga
k6 run tests/stress/load-test.js
```

```
Escenario: Carga gradual sobre GET /api/products
  - Rampa de subida:  0 -> 100 VUs en 30s
  - Meseta:           100 VUs durante 1 min
  - Rampa de bajada:  100 -> 0 VUs en 10s

Umbrales:
  - p95 latencia < 200ms
  - Tasa de error < 1%
  - Throughput > 500 req/s
```

La variable `BASE_URL` se puede configurar: `k6 run -e BASE_URL=http://production-url tests/stress/load-test.js`

---

## CI/CD

El pipeline de GitHub Actions (`.github/workflows/ci.yml`) se ejecuta en cada push a `main` y en pull requests:

### Job: build-and-test

```
Install (npm ci)
    |
  Lint (ESLint)
    |
  Build (tsc)
    |
  Base de datos de test (PostgreSQL 16 Alpine como service)
    |
  Migraciones (prisma migrate deploy)
    |
  Tests (vitest run)
```

Configuracion del job:
- `BCRYPT_SALT_ROUNDS=4` para acelerar tests
- `NODE_ENV=test`
- Base de datos: `api_db_test`

### Job: docker

Solo se ejecuta en `main` (despues de que pase build-and-test):

```
Build Docker image (docker build -t api-rest-node .)
```

---

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run dev` | Inicia en modo desarrollo con hot-reload (`tsx watch`) |
| `npm run build` | Compila TypeScript a JavaScript (`tsc`) |
| `npm start` | Ejecuta la build de produccion (`node dist/server.js`) |
| `npm run lint` | Ejecuta ESLint sobre `src/` |
| `npm run lint:fix` | Corrige errores de lint automaticamente |
| `npm run format` | Formatea el codigo con Prettier |
| `npm run prisma:generate` | Genera el cliente de Prisma |
| `npm run prisma:migrate` | Ejecuta migraciones en desarrollo (`prisma migrate dev`) |
| `npm run prisma:migrate:prod` | Ejecuta migraciones en produccion (`prisma migrate deploy`) |
| `npm run prisma:seed` | Carga datos iniciales (`tsx prisma/seed.ts`) |
| `npm test` | Ejecuta todos los tests (`vitest run`) |
| `npm run test:watch` | Ejecuta tests en modo watch (`vitest`) |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura |

---

## Licencia

ISC
