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
- [Testing](#testing)
- [CI/CD](#cicd)
- [Scripts Disponibles](#scripts-disponibles)
- [Licencia](#licencia)

---

## Descripcion General

API REST con arquitectura en capas (Layered Architecture + Service Pattern) que provee:

- **Autenticacion** con JWT (access token + refresh token)
- **Autorizacion** basada en roles (`ADMIN`, `USER`)
- **CRUD de usuarios** con soft delete y paginacion
- **CRUD de productos** con paginacion, filtrado y ordenamiento
- **Documentacion interactiva** con Swagger UI
- **Respuestas estandarizadas** en toda la API
- **Manejo centralizado de errores**
- **Logging estructurado**
- **Validacion de datos** con Zod
- **Entorno reproducible** con Docker

---

## Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Runtime | Node.js | 20 LTS |
| Framework | Express | 4.x |
| Lenguaje | TypeScript | 5.x (strict mode) |
| ORM | Prisma | 5.x |
| Base de datos | PostgreSQL | 16 |
| Validacion | Zod | 3.x |
| Autenticacion | jsonwebtoken | 9.x |
| Hash de passwords | bcrypt | 5.x |
| Documentacion | swagger-jsdoc + swagger-ui-express | - |
| Testing | Vitest + Supertest | - |
| Test de estres | k6 | - |
| Contenedores | Docker + Docker Compose | - |
| CI/CD | GitHub Actions | - |
| Linter | ESLint + Prettier | - |

---

## Arquitectura

El proyecto sigue una **Layered Architecture (3 capas)** con **Service Pattern**:

```
Client
  |  HTTP Request
  v
Router        -->  Define rutas y aplica middlewares
  |
Middleware    -->  Auth guard, validacion Zod
  |
Controller   -->  Parsea request, llama al service, responde
  |
Service       -->  Logica de negocio
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
project-root/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Pipeline CI/CD
├── prisma/
│   ├── schema.prisma               # Modelo de datos
│   └── seed.ts                     # Datos iniciales
├── src/
│   ├── config/
│   │   └── env.ts                  # Validacion de env vars con Zod
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts      # Zod schemas
│   │   │   └── auth.routes.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.schema.ts
│   │   │   └── user.routes.ts
│   │   └── product/
│   │       ├── product.controller.ts
│   │       ├── product.service.ts
│   │       ├── product.schema.ts
│   │       └── product.routes.ts
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── authenticate.ts     # Verifica JWT
│   │   │   ├── authorize.ts        # Verifica rol
│   │   │   ├── validate.ts         # Valida con Zod
│   │   │   └── error-handler.ts    # Manejo centralizado de errores
│   │   ├── utils/
│   │   │   ├── api-response.ts     # Builder de respuestas estandar
│   │   │   ├── api-error.ts        # Clase de error custom
│   │   │   └── logger.ts           # Logger estructurado
│   │   └── types/
│   │       └── index.ts            # Tipos globales
│   ├── database/
│   │   └── prisma.ts               # Singleton de PrismaClient
│   ├── app.ts                      # Configuracion de Express
│   └── server.ts                   # Entry point
├── tests/
│   ├── unit/                       # Tests unitarios de services
│   ├── integration/                # Tests de integracion HTTP
│   ├── stress/                     # Scripts k6
│   └── setup.ts                    # Config global de tests
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── tsconfig.json
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
cd api-rest-node

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

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

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecucion | `development` |
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | URL de conexion a PostgreSQL | `postgresql://user:password@localhost:5432/api_db` |
| `JWT_ACCESS_SECRET` | Secreto para firmar access tokens (min 32 chars) | `your-access-secret-min-32-chars` |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens (min 32 chars) | `your-refresh-secret-min-32-chars` |
| `JWT_ACCESS_EXPIRES_IN` | Duracion del access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Duracion del refresh token | `7d` |
| `BCRYPT_SALT_ROUNDS` | Rondas de salt para bcrypt | `10` |

> Las variables de entorno se validan al arrancar la aplicacion usando Zod. Si falta alguna variable requerida o tiene un formato invalido, la aplicacion no iniciara.

---

## Base de Datos

### Modelo de Datos

La API utiliza dos entidades principales:

**User**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico |
| `email` | String (unique) | Correo electronico |
| `password` | String | Password hasheado con bcrypt |
| `name` | String | Nombre del usuario |
| `role` | Enum (USER, ADMIN) | Rol del usuario (default: USER) |
| `createdAt` | DateTime | Fecha de creacion |
| `updatedAt` | DateTime | Fecha de ultima actualizacion |

**Product**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico |
| `title` | String | Titulo del producto |
| `description` | String (opcional) | Descripcion del producto |
| `price` | Float | Precio |
| `stock` | Int | Stock disponible (default: 0) |
| `authorId` | UUID (FK) | ID del usuario que creo el producto |
| `createdAt` | DateTime | Fecha de creacion |
| `updatedAt` | DateTime | Fecha de ultima actualizacion |

### Relaciones

- Un **User** puede tener muchos **Products** (1:N)
- Al eliminar un User, se eliminan sus Products en cascada

---

## Ejecucion

### Desarrollo

```bash
npm run dev
```

La aplicacion se inicia en modo watch con `tsx` y se reinicia automaticamente ante cambios.

### Produccion

```bash
npm run build
npm start
```

---

## Docker

### Levantar todo el entorno

```bash
docker compose up
```

Esto levanta:
- **app**: Servidor Node.js en el puerto `3000`
- **db**: PostgreSQL 16 en el puerto `5432` con volumen persistente `pgdata`

### Solo la base de datos

```bash
docker compose up -d db
```

### Dockerfile (Multi-stage)

- **Stage 1 (Build)**: `node:20-alpine`, instala dependencias y compila TypeScript
- **Stage 2 (Production)**: `node:20-alpine`, copia solo `dist/` y `node_modules` de produccion (~150MB)

---

## Endpoints de la API

### Documentacion Interactiva

La documentacion Swagger esta disponible en:

```
GET /api/docs
```

### Auth `/api/auth`

| Metodo | Ruta | Descripcion | Autenticacion |
|--------|------|-------------|---------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | No requiere |
| `POST` | `/api/auth/login` | Iniciar sesion | No requiere |
| `POST` | `/api/auth/refresh` | Renovar access token | Refresh Token |

### Users `/api/users`

| Metodo | Ruta | Descripcion | Autenticacion |
|--------|------|-------------|---------------|
| `GET` | `/api/users` | Listar usuarios (paginado) | ADMIN |
| `GET` | `/api/users/:id` | Obtener usuario por ID | Autenticado |
| `PATCH` | `/api/users/:id` | Actualizar usuario | Autenticado (owner) |
| `DELETE` | `/api/users/:id` | Eliminar usuario (soft delete) | ADMIN |

### Products `/api/products`

| Metodo | Ruta | Descripcion | Autenticacion |
|--------|------|-------------|---------------|
| `GET` | `/api/products` | Listar productos (paginado, filtrado, ordenamiento) | No requiere |
| `GET` | `/api/products/:id` | Obtener producto por ID | No requiere |
| `POST` | `/api/products` | Crear producto | Autenticado |
| `PATCH` | `/api/products/:id` | Actualizar producto | Autenticado (owner o ADMIN) |
| `DELETE` | `/api/products/:id` | Eliminar producto | Autenticado (owner o ADMIN) |

---

## Autenticacion

La API utiliza **JWT (JSON Web Tokens)** con estrategia de doble token:

### Access Token
- **Duracion**: 15 minutos
- **Ubicacion**: Header `Authorization: Bearer <token>`
- **Payload**: `{ sub: userId, role: Role }`
- **Uso**: Autenticar cada request protegida

### Refresh Token
- **Duracion**: 7 dias
- **Ubicacion**: Body en `POST /api/auth/refresh`
- **Payload**: `{ sub: userId, type: 'refresh' }`
- **Uso**: Obtener un nuevo par de tokens sin re-login

### Flujo de Autenticacion

```
1. POST /api/auth/login  -->  { accessToken, refreshToken }
2. Requests con header:  Authorization: Bearer <accessToken>
3. Cuando el access token expira  -->  POST /api/auth/refresh
4. Se recibe un nuevo par de tokens
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
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <access_token>"

# Refrescar token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'
```

---

## Formato de Respuestas

Todas las respuestas siguen un formato estandar:

### Respuesta exitosa

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

> El campo `meta` solo se incluye en respuestas paginadas.

### Respuesta de error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son validos",
    "details": [
      {
        "field": "email",
        "message": "Formato de email invalido"
      }
    ]
  }
}
```

---

## Codigos de Error

| HTTP Status | Codigo | Descripcion |
|-------------|--------|-------------|
| 400 | `VALIDATION_ERROR` | Datos de entrada invalidos |
| 401 | `UNAUTHORIZED` | Token ausente o invalido |
| 403 | `FORBIDDEN` | Sin permisos para el recurso |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Recurso duplicado (ej: email ya registrado) |
| 500 | `INTERNAL_ERROR` | Error interno del servidor |

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

### Tipos de tests

| Tipo | Herramienta | Alcance | Ubicacion |
|------|------------|---------|-----------|
| Unitario | Vitest | Services (logica de negocio) | `tests/unit/` |
| Integracion | Vitest + Supertest | Flujo HTTP completo | `tests/integration/` |
| Estres | k6 | API completa bajo carga | `tests/stress/` |

### Tests unitarios

Se testea cada service mockeando Prisma:

- **auth.service**: registro, login, refresh token, manejo de errores
- **product.service**: CRUD, paginacion, permisos de owner/admin
- **user.service**: consultas, actualizacion, eliminacion

### Tests de integracion

Flujo completo contra base de datos de test (Docker):

1. Registrar usuario -> verificar 201
2. Login -> obtener tokens -> verificar estructura
3. Crear producto con token -> verificar 201
4. Listar productos -> verificar paginacion
5. Actualizar producto como owner -> verificar 200
6. Intentar actualizar como otro usuario -> verificar 403
7. Eliminar como ADMIN -> verificar 200

### Test de estres (k6)

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

---

## CI/CD

El pipeline de GitHub Actions se ejecuta en cada push a `main` y en pull requests:

```
Install (npm ci)
    |
  Lint (ESLint)
    |
  Build (tsc)
    |
  Base de datos de test (PostgreSQL service)
    |
  Migraciones (Prisma)
    |
  Tests (Vitest)
    |
  Docker build (solo en main)
```

---

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run dev` | Inicia en modo desarrollo con hot-reload |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Ejecuta la build de produccion |
| `npm run lint` | Ejecuta ESLint sobre el codigo |
| `npm run lint:fix` | Corrige errores de lint automaticamente |
| `npm run format` | Formatea el codigo con Prettier |
| `npm run prisma:generate` | Genera el cliente de Prisma |
| `npm run prisma:migrate` | Ejecuta migraciones en desarrollo |
| `npm run prisma:migrate:prod` | Ejecuta migraciones en produccion |
| `npm run prisma:seed` | Carga datos iniciales |
| `npm test` | Ejecuta todos los tests |
| `npm run test:watch` | Ejecuta tests en modo watch |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura |

---

## Licencia

ISC
