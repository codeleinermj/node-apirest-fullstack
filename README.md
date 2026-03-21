# Node API REST Fullstack

> **Estado: En desarrollo activo** — Este proyecto se encuentra en fase de construccion. El PRD completo sera publicado al finalizar el desarrollo.

---

## Resumen del Proyecto

Proyecto fullstack que implementa una API REST profesional con su frontend de pruebas. El backend maneja autenticacion JWT, autorizacion por roles, CRUD completo de productos y usuarios, documentacion Swagger, testing unitario/integracion y pruebas de estres. El frontend consume todos los endpoints con una interfaz moderna, tema dark y animaciones fluidas.

---

## PRD (Product Requirements Document)

### Vision

Construir una API REST robusta y profesional como pieza de portafolio, acompanada de un frontend interactivo que permita probar todos los endpoints en tiempo real.

### Objetivos

1. Implementar autenticacion JWT con access/refresh tokens y roles (ADMIN, USER)
2. CRUD completo de productos con paginacion, filtrado y ordenamiento
3. Gestion de usuarios con autorizacion basada en roles
4. Documentacion automatica con Swagger/OpenAPI
5. Testing: unitario, integracion y estres (k6)
6. Frontend moderno con Next.js para probar toda la API visualmente
7. Entorno reproducible con Docker

### Modulos

| Modulo | Backend | Frontend | Estado |
|--------|---------|----------|--------|
| Autenticacion (Register/Login/Refresh) | Implementado | Implementado | En desarrollo |
| Productos (CRUD + filtros + paginacion) | Implementado | Implementado | En desarrollo |
| Usuarios (CRUD + roles) | Implementado | Implementado | En desarrollo |
| Documentacion Swagger | Implementado | N/A | En desarrollo |
| Tests unitarios | Implementado | Pendiente | En desarrollo |
| Tests de integracion | Implementado | Pendiente | En desarrollo |
| Test de estres (k6) | Implementado | N/A | En desarrollo |
| CI/CD (GitHub Actions) | Implementado | Pendiente | En desarrollo |

---

## Stack Tecnologico

### Backend

| Tecnologia | Uso |
|-----------|-----|
| Node.js 20 LTS | Runtime |
| Express 4.x | Framework HTTP |
| TypeScript 5.x (strict) | Lenguaje |
| Prisma 5.x | ORM type-safe |
| PostgreSQL 16 | Base de datos |
| Zod | Validacion de datos |
| JWT (jsonwebtoken) | Autenticacion |
| bcrypt | Hash de passwords |
| Swagger (swagger-jsdoc) | Documentacion API |
| Vitest + Supertest | Testing |
| k6 | Test de estres |
| Docker + Compose | Contenedores |
| GitHub Actions | CI/CD |
| ESLint + Prettier | Linting y formato |

### Frontend

| Tecnologia | Uso |
|-----------|-----|
| Next.js 15 (App Router) | Framework React |
| React 19 | UI Library |
| TypeScript 5.x (strict) | Lenguaje |
| Tailwind CSS 4 | Estilos utility-first |
| Framer Motion 12 | Animaciones fluidas |
| Lucide React | Iconos |

---

## Estructura del Proyecto

```
node-apirest-fullstack/
├── backend/                 # API REST
│   ├── src/
│   │   ├── config/          # Variables de entorno (Zod)
│   │   ├── database/        # Prisma client singleton
│   │   ├── modules/
│   │   │   ├── auth/        # Register, Login, Refresh
│   │   │   ├── user/        # CRUD usuarios
│   │   │   └── product/     # CRUD productos
│   │   └── shared/          # Middlewares, utils, types
│   ├── prisma/              # Schema, migraciones, seeds
│   ├── tests/               # Unit, integration, stress
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend/                # Cliente Next.js
│   └── src/
│       ├── app/             # Pages (App Router)
│       ├── components/      # UI components animados
│       ├── context/         # Auth context (JWT)
│       └── lib/             # API client, types, transitions
│
└── README.md
```

---

## Inicio Rapido

### Requisitos

- Node.js >= 20
- Docker y Docker Compose
- npm >= 9

### Instalacion

```bash
# Clonar
git clone https://github.com/codeleinermj/node-apirest-fullstack.git
cd node-apirest-fullstack

# Backend
cd backend
npm install
cp .env.example .env          # Editar con tus valores
docker compose up -d db       # Levantar PostgreSQL
npm run prisma:migrate        # Crear tablas
npm run prisma:generate       # Generar cliente Prisma
npm run prisma:seed           # Datos iniciales (opcional)
npm run dev                   # http://localhost:3000

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev                   # http://localhost:3001
```

### URLs

| Servicio | URL |
|----------|-----|
| Backend API | http://localhost:3000/api |
| Swagger Docs | http://localhost:3000/api/docs |
| Frontend | http://localhost:3001 |
| Health Check | http://localhost:3000/api/health |

### Usuarios de prueba (despues del seed)

| Email | Password | Rol |
|-------|----------|-----|
| admin@example.com | admin123 | ADMIN |
| user@example.com | user123 | USER |

---

## Licencia

ISC
