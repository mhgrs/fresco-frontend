# Fresco POS — Frontend

React/Vite SPA para el sistema de punto de venta Fresco. Se comunica con el backend Django vía REST API y funciona como PWA con modo offline.

**Producción:** [frescopos.cl](https://frescopos.cl) (Cloudflare Workers)  
**Backend:** [fresco-backend](https://github.com/mhgrs/fresco-backend)

---

## Stack

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 19 | UI |
| Vite + Rolldown | 8 | Build |
| React Router | 7 | Routing |
| Tailwind CSS | 3 | Estilos |
| Axios | — | HTTP client con interceptores JWT |
| Recharts | — | Gráficos de ventas |
| html5-qrcode | — | Escaneo de código de barras |
| Vitest | — | Tests unitarios |
| Playwright | — | Tests E2E |

---

## Instalación local

**Requisitos:** Node.js 18+, backend corriendo en `http://localhost:8000`

```bash
git clone https://github.com/mhgrs/fresco-frontend.git
cd fresco-frontend
npm install
npm run dev
# → http://localhost:5173
```

No se necesita `.env` en desarrollo; `VITE_API_URL` cae en `http://localhost:8000/api/` por defecto.

### Comandos disponibles

```bash
npm run dev          # Servidor de desarrollo Vite (:5173)
npm run build        # Build de producción → dist/
npm run preview      # Preview del build
npm run lint         # ESLint
npm test             # Unit tests (Vitest)
npm run test:watch   # Unit tests en modo watch
npm run test:e2e     # Tests E2E con Playwright (requiere backend + frontend corriendo)
npm run test:e2e:ui  # UI visual de Playwright
```

---

## Variables de entorno

```env
# .env.production
VITE_API_URL=https://pos-system-production-2606.up.railway.app/api
```

En desarrollo no es necesario; el cliente Axios usa `http://localhost:8000/api/` por defecto.

---

## Arquitectura

### Routing

**Rutas públicas** (`src/router/RutasPublicas.jsx`):

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `LandingPage` | Página pública con precios |
| `/fresco-login` | `Login` | Inicio de sesión |
| `/registro` | `Registro` | Registro con T&C |
| `/verificar-email/:token` | `VerificarEmail` | Confirmación de cuenta |
| `/recuperar-contrasena` | `RecuperarContrasena` | Solicitar reset |
| `/reset-password/:token` | `ResetPassword` | Confirmar nueva contraseña |
| `/unirse/:codigo` | `PaginaUnirse` | Unirse a empresa con código |
| `/terminos` | `TerminosCondiciones` | T&C |
| `/privacidad` | `PoliticaPrivacidad` | Política de privacidad |

**Rutas autenticadas** (`src/router/RutasAutenticadas.jsx`) — protegidas por `PlanGuard`:

| Ruta | Componente | Plan mínimo |
|------|-----------|-------------|
| `/dashboard` | `Dashboard` | Gratis |
| `/pos` | `PuntoDeVenta` | Gratis |
| `/inventario` | `CatalogoProductos` | Gratis |
| `/inventario/nuevo` | `FormularioProducto` | Gratis |
| `/inventario/editar/:id` | `FormularioProducto` | Gratis |
| `/categorias` | `GestorCategorias` | Gratis |
| `/alertas` | `AlertasInventario` | Gratis |
| `/onboarding` | `OnboardingEmpresa` | — |
| `/cierre-caja` | `CierreCaja` | Básico+ |
| `/movimientos-caja` | `MovimientosCaja` | Básico+ |
| `/inventario/movimientos` | `MovimientosInventario` | Básico+ |
| `/reportes` | `Reportes` | Básico+ |
| `/ventas` | `HistorialVentas` | Supervisor+ |
| `/actividad` | `ActividadNegocio` | Supervisor+ |
| `/equipo` | `GestionEquipo` | Admin |
| `/configuracion` | `Configuracion` | Gratis |

### Servicios (src/services/)

Cada archivo encapsula las llamadas Axios a su dominio:

- `api.js` — instancia base de Axios + interceptor de refresh token silencioso
- `auth.js` — login, logout, registro, verificación de email
- `usuarios.js` — `me()`, cambio de contraseña
- `productos.js` — CRUD de productos, ajuste de stock
- `ventas.js` — registrar ventas, métricas, reporte Z
- `suscripcion.js` — planes, pago con Flow.cl, historial
- `roles.js` — gestión de permisos y roles
- `empresas.js` — crear empresa, generar código
- `categorias.js` — CRUD de categorías

### Autenticación

1. `POST /api/inventario/usuarios/login/` → el backend setea cookies HttpOnly (`access` + `refresh`).
2. Axios envía las cookies automáticamente con `withCredentials: true`.
3. Si el access token expira, el interceptor en `api.js` llama a `POST /api/token/refresh/` de forma transparente y reintenta la petición original.
4. En `App.jsx`, al montar, se llama a `usuarios.me()` para hidratar el estado de sesión.

### Modo offline

- Las ventas se guardan en `localStorage` como `ventas_offline` cuando no hay conexión.
- `src/utils/syncVentas.js` sincroniza automáticamente cada 60s y cuando `navigator.onLine` cambia a `true`.
- `public/sw.js` (Service Worker) cachea la app shell para que la interfaz cargue sin red.

### Estado global

No hay un store centralizado (sin Redux/Zustand). El estado se maneja con:
- `useState` / `useEffect` por componente
- Props drilling controlado
- `localStorage` para carrito (`useCarrito`), sesión y ventas offline
- `CustomEvent('errorServidor')` para propagar errores 500 desde cualquier servicio hacia `ModuleLayout`

### Layout autenticado

`ModuleLayout.jsx` es el wrapper de todas las rutas autenticadas. Incluye:
- Navbar y sidebar
- Indicador de estado de red (`NetworkStatusIndicator`)
- Feedback de sincronización offline (`SyncFeedback`)
- Captura de `errorServidor` events para mostrar toast de error

---

## Estructura de directorios

```
src/
├── components/
│   ├── App.jsx                  # Componente raíz: sesión, sync offline, rutas
│   ├── dashboard/               # ModuleCard, AlertasDropdown, OnboardingChecklist, UpgradeBanner
│   ├── layout/                  # ModuleLayout, AdminRedirect, BotonVolver
│   ├── pos/                     # PuntoDeVenta y subcomponentes (carrito, pago, ticket)
│   ├── cierre/                  # CierreCaja y subcomponentes (resumen, semáforo, KPIs)
│   ├── reportes/                # Reportes y subcomponentes (charts, métricas)
│   ├── actividad/               # ActividadNegocio y tabs (ventas, turnos, movimientos)
│   ├── equipo/                  # GestionEquipo, GestorRoles
│   ├── catalogo/                # ProductoFila
│   ├── form/                    # CodigoBarrasField, ProveedoresManager, SugerenciasInput
│   ├── ui/                      # Modal, ErrorBoundary, NetworkStatusIndicator, SyncFeedback
│   └── legal/                   # TerminosContenido, PrivacidadContenido
├── hooks/
│   ├── useCarrito.js            # Estado del carrito (localStorage)
│   ├── usePermisos.js           # Verificar permisos del usuario actual
│   ├── useProductSearch.js      # Búsqueda de productos con debounce
│   ├── useNetworkStatus.js      # Estado online/offline
│   ├── useNotificacion.js       # Toasts de notificación
│   └── useLocalStorage.js       # Hook genérico para localStorage
├── router/
│   ├── RutasPublicas.jsx        # Rutas sin auth
│   └── RutasAutenticadas.jsx    # Rutas con PlanGuard
├── services/
│   ├── api.js                   # Axios + interceptores JWT
│   ├── auth.js
│   ├── usuarios.js
│   ├── productos.js
│   ├── ventas.js
│   ├── suscripcion.js
│   ├── roles.js
│   ├── empresas.js
│   └── categorias.js
├── utils/
│   ├── syncVentas.js            # Sincronización offline
│   ├── format.js                # Formatos de dinero, fecha, etc.
│   └── logger.js                # Logging estructurado (desactivado en prod)
└── constants/
    ├── roles.js                 # ADMIN, CAJERO, BODEGA, SUPERVISOR
    └── metodoPago.js            # EFECTIVO, TARJETA, TRANSFERENCIA, ANOTADO

public/
├── sw.js                        # Service Worker (PWA + caché offline)
├── manifest.json                # Metadatos PWA
└── icons/                       # Iconos de la app (varios tamaños)

e2e/                             # Tests E2E con Playwright
├── 01_autenticacion.spec.js
├── 02_multitenancy.spec.js
├── 03_pos.spec.js
├── 04_planes.spec.js
├── 05_roles.spec.js
├── 06_catalogo.spec.js
├── 07_cierre_caja.spec.js
├── 08_reportes.spec.js
├── 09_suscripcion.spec.js
└── 10_seguridad.spec.js
```

---

## Deploy (Cloudflare Workers)

```bash
npm install -g wrangler
wrangler login

# Build de producción
npm run build

# Deploy
wrangler deploy
```

`worker.js` en la raíz recibe todas las peticiones:
- `/api/*`, `/fresco-admin/*`, `/static/*` → proxy al backend en Railway
- Todo lo demás → sirve la SPA desde `dist/`

Si el backend cambia de URL, actualiza la variable destino en `worker.js` y en `wrangler.toml`.

---

## Tests

```bash
# Unit tests
npm test

# E2E (requiere backend en :8000 y frontend en :5173)
npm run test:e2e
```

Los tests E2E cubren: autenticación, multi-tenancy, POS, planes, roles, catálogo, cierre de caja, reportes, suscripción y seguridad.
