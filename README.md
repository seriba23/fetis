# Fetis Muebles

Sistema integral para Fetis: landing page pública + portal admin interno (clientes, citas, cotizaciones, pagos, gastos, galería, dashboard).

## Stack

- **Backend**: NestJS + Prisma + MySQL (MariaDB)
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Monorepo**: Turborepo + npm workspaces

## Estructura

```
fetis/
├── apps/
│   ├── api/        Backend NestJS (puerto 3001)
│   └── web/        Next.js — landing + /admin (puerto 3000)
├── packages/
│   └── shared/     DTOs y tipos compartidos
├── prisma/         Schema + migraciones + seed
└── uploads/        Storage local de imágenes
```

## Requisitos

- Node.js >= 20
- MySQL o MariaDB (XAMPP funciona)
- npm 10+

## Setup inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales reales

# 3. Crear la base de datos y aplicar migraciones
npm run db:migrate

# 4. Sembrar datos iniciales (catálogo de muebles, categorías de galería, admin)
npm run db:seed

# 5. Levantar todo en modo desarrollo
npm run dev
```

Landing: http://localhost:4000
Admin: http://localhost:4000/admin
API: http://localhost:4001/api

## Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta API y Web en paralelo |
| `npm run build` | Build de producción de todo |
| `npm run db:generate` | Regenera el cliente Prisma |
| `npm run db:migrate` | Crea/aplica migraciones |
| `npm run db:seed` | Reinicia el seed |
| `npm run db:studio` | Abre Prisma Studio en navegador |
| `npm run db:reset` | DROP + recrear + seed (cuidado en prod) |

## Deploy en VPS

Ver `docs/deploy.md` (se generará al final del desarrollo).
