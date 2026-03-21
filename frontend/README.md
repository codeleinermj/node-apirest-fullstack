# Frontend - API REST Tester

> **Estado: En desarrollo activo** — El PRD completo sera publicado al finalizar el desarrollo.

---

## Resumen

Frontend moderno construido con Next.js 15, React 19 y TypeScript para probar visualmente todos los endpoints de la API REST backend. Incluye tema dark, animaciones fluidas con Framer Motion, autenticacion JWT con auto-refresh de tokens y componentes interactivos.

---

## Funcionalidades

- **Home** — Status del backend en tiempo real, navegacion a todos los modulos
- **Register/Login** — Formularios animados con manejo de errores
- **Dashboard** — Perfil editable, lista de productos propios
- **Products** — CRUD completo con busqueda, filtros (precio, orden), paginacion, modales para crear/editar
- **Users** (Admin) — Panel de gestion de usuarios con roles, eliminacion
- **Aurora Background** — Fondo animado con canvas (Perlin noise + gradientes)
- **Toast Notifications** — Sistema de notificaciones con animaciones de entrada/salida
- **Page Transitions** — Transiciones fluidas entre paginas con Framer Motion
- **Scroll Progress** — Barra de progreso gradient en el top
- **Auto Refresh JWT** — Renovacion automatica de tokens expirados

---

## Stack Tecnologico

| Tecnologia | Version | Uso |
|-----------|---------|-----|
| Next.js | 15.x | Framework React (App Router) |
| React | 19.x | UI Library |
| TypeScript | 5.x | Lenguaje (strict mode) |
| Tailwind CSS | 4.x | Estilos utility-first, tema dark |
| Framer Motion | 12.x | Animaciones, transiciones, gestos |
| Lucide React | Latest | Iconos SVG |

---

## Estructura

```
frontend/
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout
    │   ├── providers.tsx        # Auth, Toast, Navbar providers
    │   ├── template.tsx         # Page transitions (Framer Motion)
    │   ├── page.tsx             # Home con health check
    │   ├── login/page.tsx       # Login form
    │   ├── register/page.tsx    # Register form
    │   ├── dashboard/page.tsx   # Perfil + mis productos
    │   ├── products/page.tsx    # CRUD productos
    │   └── users/page.tsx       # Admin: gestion usuarios
    ├── components/
    │   ├── aurora-background.tsx # Canvas animated background
    │   ├── navbar.tsx           # Nav con layout animations
    │   ├── modal.tsx            # Modal con AnimatePresence
    │   ├── toast.tsx            # Notification system
    │   ├── scroll-progress.tsx  # Scroll progress bar
    │   └── animated-container.tsx # Reusable animation wrapper
    ├── context/
    │   └── auth-context.tsx     # JWT auth state management
    └── lib/
        ├── api.ts               # HTTP client con auto-refresh
        ├── types.ts             # TypeScript interfaces
        └── transitions.ts       # Framer Motion presets
```

---

## Ejecucion

```bash
# Instalar dependencias
npm install

# Desarrollo (requiere backend corriendo en :3000)
npm run dev        # http://localhost:3001

# Build de produccion
npm run build
npm start
```

---

## Conexion con Backend

El frontend se conecta al backend via la variable de entorno:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Definida en `.env.local` (no se sube al repositorio).

Adicionalmente, `next.config.ts` tiene un rewrite que proxea `/api/*` al backend para evitar problemas de CORS en desarrollo.

---

## Licencia

ISC
