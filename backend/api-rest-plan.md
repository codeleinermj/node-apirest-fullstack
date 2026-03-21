# 📋 Plan de Proyecto — API REST Node.js

> **Proyecto:** API REST profesional con Node.js  
> **Fecha:** Marzo 2026  
> **Metodología:** Waterfall adaptado (fases secuenciales con iteración interna)  
> **Estado:** Fase de Planificación

---

## 1. Análisis de Requerimientos

### 1.1 Requerimientos Funcionales

#### Módulo de Autenticación

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | Registro de usuario con email y password | Alta |
| RF-02 | Login con generación de JWT (access + refresh token) | Alta |
| RF-03 | Refresh token para renovar sesión sin re-login | Alta |
| RF-04 | Hash de passwords con bcrypt (salt rounds: 10) | Alta |
| RF-05 | Roles de usuario: `ADMIN` y `USER` | Alta |
| RF-06 | Protección de rutas por rol (middleware de autorización) | Alta |

#### Módulo de Usuarios

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-07 | Listar usuarios (solo ADMIN, paginado) | Media |
| RF-08 | Obtener perfil de usuario por ID | Media |
| RF-09 | Actualizar perfil propio | Media |
| RF-10 | Eliminar usuario (solo ADMIN, soft delete) | Baja |

#### Módulo de Productos (Entidad de dominio)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-11 | Crear producto (usuario autenticado) | Alta |
| RF-12 | Listar productos con paginación, filtrado y ordenamiento | Alta |
| RF-13 | Obtener producto por ID | Alta |
| RF-14 | Actualizar producto (solo owner o ADMIN) | Alta |
| RF-15 | Eliminar producto (solo owner o ADMIN) | Media |

#### Módulo de Documentación

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-16 | Swagger UI accesible en `/api/docs` | Alta |
| RF-17 | Esquemas OpenAPI auto-generados desde código | Alta |

### 1.2 Requerimientos No Funcionales

| ID | Descripción | Categoría |
|----|-------------|-----------|
| RNF-01 | Respuestas en formato estándar `{ success, data, error, meta }` | Consistencia |
| RNF-02 | Manejo centralizado de errores con códigos HTTP correctos | Robustez |
| RNF-03 | Logging estructurado (request ID, timestamp, level) | Observabilidad |
| RNF-04 | Variables de entorno validadas al arrancar con Zod | Seguridad |
| RNF-05 | TypeScript en modo strict sin `any` explícitos | Calidad |
| RNF-06 | Tiempo de respuesta p95 < 200ms bajo carga normal | Performance |
| RNF-07 | Cobertura de tests > 70% en servicios | Calidad |
| RNF-08 | Pipeline CI/CD funcional en GitHub Actions | DevOps |
| RNF-09 | Entorno reproducible con Docker en un solo comando | DevOps |

---

## 2. Arquitectura

### 2.1 Decisión Arquitectónica

**Arquitectura elegida: Layered Architecture (3 capas) con Service Pattern**

#### Alternativas evaluadas y descartadas

| Arquitectura | Veredicto | Razón |
|-------------|-----------|-------|
| **Hexagonal / Clean Architecture** | ❌ Descartada | Agrega puertos y adaptadores abstractos innecesarios para un solo adaptador HTTP + un ORM. Overengineering para este alcance. |
| **CQRS + Event Sourcing** | ❌ Descartada | Diseñada para sistemas donde lectura y escritura tienen necesidades radicalmente distintas. No aplica aquí. |
| **Microservicios** | ❌ Descartada | Un solo dominio acotado. El overhead operacional (service mesh, orquestación, tracing distribuido) no se justifica. |
| **Layered + Service Pattern** | ✅ Elegida | Separación clara de responsabilidades, testeable, escalable hasta apps medianas sin ceremonia innecesaria. |

#### Justificación detallada

1. **Single Responsibility**: cada capa tiene exactamente una responsabilidad.
2. **Testabilidad**: los services son testeables sin levantar HTTP.
3. **Reemplazabilidad**: cambiar Prisma por Drizzle implica tocar solo la capa de database.
4. **Pragmatismo**: cero abstracciones que no se usen. Prisma ya es el repository.
5. **Escalabilidad**: agregar un módulo nuevo es copiar la estructura y empezar.

### 2.2 Flujo de una Request

```
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           │ HTTP Request
                           ▼
                    ┌─────────────┐
                    │   Router    │  Define rutas y aplica middlewares
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Middleware   │  Auth guard, Zod validation
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Controller  │  Parsea request → llama service → responde
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Service    │  TODA la lógica de negocio
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Prisma    │  ORM type-safe → queries SQL
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │  Base de datos
                    └─────────────┘
```

### 2.3 Estructura de Carpetas

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
│   │   └── env.ts                  # Validación de env vars con Zod
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
│   │   │   └── error-handler.ts    # Manejo centralizado
│   │   ├── utils/
│   │   │   ├── api-response.ts     # Builder de respuestas estándar
│   │   │   ├── api-error.ts        # Clase de error custom
│   │   │   └── logger.ts           # Logger estructurado
│   │   └── types/
│   │       └── index.ts            # Tipos globales
│   ├── database/
│   │   └── prisma.ts               # Singleton de PrismaClient
│   ├── app.ts                      # Configuración de Express
│   └── server.ts                   # Entry point
├── tests/
│   ├── unit/
│   │   ├── auth.service.test.ts
│   │   ├── user.service.test.ts
│   │   └── product.service.test.ts
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── user.test.ts
│   │   └── product.test.ts
│   ├── stress/
│   │   └── load-test.js            # Script k6
│   └── setup.ts                    # Config global de tests
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Diseño Técnico

### 3.1 Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| Runtime | Node.js | 20 LTS | Soporte largo, rendimiento estable |
| Framework | Express | 4.x | Ecosistema maduro, flexibilidad total |
| Lenguaje | TypeScript | 5.x | Type safety end-to-end, modo strict |
| ORM | Prisma | 5.x | Queries type-safe, migraciones declarativas |
| Base de datos | PostgreSQL | 16 | Robusta, soporte JSON, índices avanzados |
| Validación | Zod | 3.x | Inferencia de tipos desde schemas |
| Auth | jsonwebtoken | 9.x | Estándar JWT, amplio soporte |
| Hash | bcrypt | 5.x | Estándar de industria para passwords |
| Docs | swagger-jsdoc + swagger-ui-express | — | Auto-generación desde decoradores JSDoc |
| Testing | Vitest + Supertest | — | Rápido, compatible TS nativo |
| Stress test | k6 | — | Simula carga real, métricas detalladas |
| Containers | Docker + Compose | — | Entorno 100% reproducible |
| CI/CD | GitHub Actions | — | Integrado con repositorio |
| Linter | ESLint + Prettier | — | Consistencia de código |

### 3.2 Modelo de Datos (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String
  name      String
  role      Role      @default(USER)
  products  Product[]
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@map("users")
}

model Product {
  id          String   @id @default(uuid())
  title       String
  description String?
  price       Float
  stock       Int      @default(0)
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId    String   @map("author_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([authorId])
  @@index([price])
  @@map("products")
}
```

### 3.3 Diseño de Endpoints

#### Auth (`/api/auth`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/refresh` | Renovar access token | Refresh Token |

#### Users (`/api/users`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/users` | Listar usuarios (paginado) | ADMIN |
| GET | `/api/users/:id` | Obtener usuario por ID | AUTH |
| PATCH | `/api/users/:id` | Actualizar usuario | AUTH (owner) |
| DELETE | `/api/users/:id` | Eliminar usuario | ADMIN |

#### Products (`/api/products`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/products` | Listar productos (paginado) | No |
| GET | `/api/products/:id` | Obtener producto por ID | No |
| POST | `/api/products` | Crear producto | AUTH |
| PATCH | `/api/products/:id` | Actualizar producto | AUTH (owner/admin) |
| DELETE | `/api/products/:id` | Eliminar producto | AUTH (owner/admin) |

### 3.4 Formato de Respuesta Estándar

#### Respuesta exitosa

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

#### Respuesta de error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son válidos",
    "details": [
      {
        "field": "email",
        "message": "Formato de email inválido"
      }
    ]
  }
}
```

### 3.5 Códigos de Error

| Código HTTP | Error Code | Descripción |
|-------------|-----------|-------------|
| 400 | `VALIDATION_ERROR` | Datos de entrada inválidos |
| 401 | `UNAUTHORIZED` | Token ausente o inválido |
| 403 | `FORBIDDEN` | Sin permisos para el recurso |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Recurso duplicado (ej: email) |
| 500 | `INTERNAL_ERROR` | Error interno del servidor |

### 3.6 Estrategia de Autenticación

```
┌────────────────────────────────────────────────────────┐
│                    JWT Strategy                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Access Token                                          │
│  ├── Duración: 15 minutos                              │
│  ├── Ubicación: Header Authorization: Bearer <token>   │
│  ├── Payload: { sub: userId, role: Role }              │
│  └── Uso: Autenticar cada request                      │
│                                                        │
│  Refresh Token                                         │
│  ├── Duración: 7 días                                  │
│  ├── Ubicación: Body en /auth/refresh                  │
│  ├── Payload: { sub: userId, type: 'refresh' }         │
│  └── Uso: Obtener nuevo access token                   │
│                                                        │
│  Flujo:                                                │
│  1. POST /auth/login → { accessToken, refreshToken }   │
│  2. Requests con Authorization: Bearer <accessToken>   │
│  3. Cuando expira → POST /auth/refresh                 │
│  4. Se recibe nuevo par de tokens                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 3.7 Variables de Entorno

```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/api_db

# JWT
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=10
```

---

## 4. Docker

### 4.1 Estrategia de Containerización

```
┌─────────────────────────────────────────────┐
│              Docker Compose                  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐     ┌─────────────────┐   │
│  │   app        │────▶│   db            │   │
│  │   Node.js    │     │   PostgreSQL 16 │   │
│  │   Puerto 3000│     │   Puerto 5432   │   │
│  └─────────────┘     └───────┬─────────┘   │
│                              │              │
│                       ┌──────▼──────┐       │
│                       │  pgdata     │       │
│                       │  (volume)   │       │
│                       └─────────────┘       │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.2 Dockerfile (Multi-stage)

- **Stage 1 — Build**: `node:20-alpine`, instala dependencias, compila TypeScript.
- **Stage 2 — Production**: `node:20-alpine`, copia solo `dist/` + `node_modules` de producción. Imagen final ~150MB.

---

## 5. Testing

### 5.1 Estrategia de Testing

| Tipo | Herramienta | Alcance | Objetivo |
|------|------------|---------|----------|
| **Unitario** | Vitest | Services | Lógica de negocio aislada |
| **Integración** | Vitest + Supertest | Endpoints | Flujo completo HTTP → DB |
| **Estrés** | k6 | API completa | Performance bajo carga |

### 5.2 Tests Unitarios

Testear cada service mockeando Prisma:

- `auth.service.test.ts`
  - ✅ `register()` hashea el password correctamente
  - ✅ `register()` lanza error si el email ya existe (CONFLICT)
  - ✅ `login()` retorna access + refresh token con datos válidos
  - ✅ `login()` lanza error con credenciales inválidas (UNAUTHORIZED)
  - ✅ `refresh()` genera nuevos tokens con refresh token válido
  - ✅ `refresh()` lanza error con token expirado

- `product.service.test.ts`
  - ✅ `create()` crea producto y lo asocia al author
  - ✅ `findAll()` retorna datos paginados con meta
  - ✅ `update()` permite actualizar si es owner
  - ✅ `update()` permite actualizar si es ADMIN
  - ✅ `update()` lanza FORBIDDEN si no es owner ni ADMIN
  - ✅ `delete()` elimina producto correctamente

### 5.3 Tests de Integración

Flujo completo contra base de datos de test (levantada en Docker):

1. Registrar usuario → verificar 201
2. Login → obtener tokens → verificar estructura
3. Crear producto con token → verificar 201
4. Listar productos → verificar paginación
5. Actualizar producto como owner → verificar 200
6. Intentar actualizar como otro usuario → verificar 403
7. Eliminar como ADMIN → verificar 200

### 5.4 Test de Estrés (k6)

```
Escenario: Carga gradual sobre GET /api/products
├── Rampa de subida:  0 → 100 VUs en 30s
├── Meseta:           100 VUs durante 1 min
├── Rampa de bajada:  100 → 0 VUs en 10s
│
├── Umbrales (thresholds):
│   ├── http_req_duration p(95) < 200ms
│   ├── http_req_failed < 1%
│   └── http_reqs > 500/s
```

---

## 6. CI/CD — GitHub Actions

### 6.1 Pipeline

```
┌──────────────────────────────────────────────────────┐
│                    CI Pipeline                        │
│                                                      │
│  Trigger: push a main, pull requests                 │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Install  │─▶│  Lint    │─▶│  Build   │           │
│  │ npm ci   │  │ eslint   │  │ tsc      │           │
│  └──────────┘  └──────────┘  └────┬─────┘           │
│                                    │                  │
│                             ┌──────▼─────┐           │
│                             │  Test DB   │           │
│                             │ PostgreSQL │           │
│                             │ (service)  │           │
│                             └──────┬─────┘           │
│                                    │                  │
│                             ┌──────▼─────┐           │
│                             │  Migrate   │           │
│                             │  prisma    │           │
│                             └──────┬─────┘           │
│                                    │                  │
│                             ┌──────▼─────┐           │
│                             │   Tests    │           │
│                             │  vitest    │           │
│                             └──────┬─────┘           │
│                                    │                  │
│                             ┌──────▼─────┐           │
│                             │  Docker    │ (solo main)│
│                             │  build     │           │
│                             └────────────┘           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 7. Cronograma de Implementación

### Fases de Codificación

| Fase | Entregable | Dependencia | Estimación |
|------|-----------|-------------|------------|
| **1** | Setup: tsconfig, eslint, prettier, estructura | Ninguna | 1h |
| **2** | Docker Compose + Prisma schema + migración | Fase 1 | 1h |
| **3** | Config (env validation), app.ts, server.ts | Fase 2 | 30min |
| **4** | Shared: error handler, response builder, middlewares | Fase 3 | 1.5h |
| **5** | Módulo Auth: register, login, refresh, guards | Fase 4 | 2h |
| **6** | Módulo User: CRUD con autorización | Fase 5 | 1.5h |
| **7** | Módulo Product: CRUD completo + paginación | Fase 5 | 1.5h |
| **8** | Swagger: documentación de todos los endpoints | Fase 7 | 1h |
| **9** | Tests unitarios + integración | Fase 7 | 2h |
| **10** | Test de estrés con k6 | Fase 9 | 30min |
| **11** | GitHub Actions pipeline | Fase 9 | 1h |
| **12** | README profesional + .env.example | Fase 11 | 30min |
| | **Total estimado** | | **~13h** |

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Prisma genera queries lentas en paginación | Baja | Media | Usar `cursor-based pagination` si se detecta |
| JWT no revocable (access token) | Media | Media | Tiempo de vida corto (15min) + refresh token |
| Docker build lento en CI | Media | Baja | Cache de layers en GitHub Actions |
| Cambio a Drizzle en el futuro | Baja | Media | Services no importan Prisma directamente, usan abstracción mínima |

---

## 9. Decisiones Pendientes

> **⚠️ ACCIÓN REQUERIDA**: Confirmar la entidad de dominio.
>
> Se propone **"Productos"** (título, descripción, precio, stock) como entidad
> de dominio para demostrar el CRUD completo. Si preferís otra entidad
> (Tareas, Posts, Proyectos, etc.), el plan se adapta sin cambios
> arquitectónicos.

---

*Documento generado como parte del proceso de planificación. Fase siguiente: codificación (Fase 1) tras confirmación.*
