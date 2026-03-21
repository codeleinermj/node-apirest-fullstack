# Guia de Contribucion

## Configuracion del entorno

1. Clonar el repositorio
2. Ejecutar `npm install`
3. Copiar `.env.example` a `.env` y configurar las variables
4. Levantar la base de datos: `docker compose up -d db`
5. Ejecutar migraciones: `npm run prisma:migrate`

## Convenciones de codigo

### TypeScript
- Modo strict habilitado, sin uso de `any` explicito
- Todo parametro y retorno debe tener tipo (se infiere cuando es posible)

### Estilo
- **Prettier** con single quotes, trailing commas, 100 chars de ancho
- **ESLint** con reglas de typescript-eslint
- Ejecutar `npm run lint:fix` y `npm run format` antes de commitear

### Estructura de modulos

Cada modulo sigue la estructura:
```
src/modules/<nombre>/
  ├── <nombre>.controller.ts   # Parsea request y llama al service
  ├── <nombre>.service.ts      # Logica de negocio
  ├── <nombre>.schema.ts       # Schemas de validacion Zod
  └── <nombre>.routes.ts       # Definicion de rutas
```

### Convenciones de nombres
- Archivos: `kebab-case` (ej: `error-handler.ts`)
- Clases: `PascalCase`
- Funciones y variables: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Tablas de DB: `snake_case` (via `@@map` en Prisma)

## Flujo de trabajo

1. Crear branch desde `main`: `git checkout -b feature/nombre-descriptivo`
2. Hacer cambios siguiendo las convenciones
3. Ejecutar lint: `npm run lint`
4. Ejecutar tests: `npm test`
5. Commitear con mensajes descriptivos
6. Crear Pull Request hacia `main`

## Testing

- Los tests unitarios van en `tests/unit/`
- Los tests de integracion van en `tests/integration/`
- Cobertura minima objetivo: 70% en services
- Ejecutar `npm run test:coverage` para verificar cobertura
