# Design Document: Countries Explorer MERN

## Overview

Countries Explorer es una aplicación web full-stack construida sobre el stack MERN (MongoDB, Express, React, Node.js). Consume la API pública de RestCountries para mostrar información de países en tiempo real, ofrece búsqueda en tiempo real, eliminación de países con restauración, generación de PDFs individuales y generales, y autenticación de usuarios mediante JWT. El proyecto se despliega en Railway con dos servicios independientes (frontend y backend) y se gestiona con GitHub siguiendo una estrategia de ramas `main / develop / feature/*`.

### Objetivos de diseño

- **Separación de responsabilidades**: el frontend React gestiona la UI y el estado global; el backend Express actúa como proxy/API hacia RestCountries y como generador de PDFs.
- **Seguridad**: todas las rutas de la aplicación (excepto `/login`) están protegidas por JWT; el backend valida el token en cada solicitud protegida.
- **Rendimiento**: el filtrado de búsqueda ocurre en el cliente (< 100 ms) sobre datos ya cargados; el backend no se consulta en cada keystroke.
- **Portabilidad**: la configuración sensible (URLs, secretos) se gestiona exclusivamente mediante variables de entorno.

---

## Architecture

La aplicación sigue una arquitectura de **tres capas** con comunicación HTTP/REST:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  React App (Vite)                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │   │
│  │  │  Router  │  │  Pages   │  │Components│  │ Store  │  │   │
│  │  │  (RRv6)  │  │ Login /  │  │CountryCard│  │(Zustand│  │   │
│  │  │          │  │ Home     │  │SearchBar │  │/Context│  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST (JWT en Authorization header)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                   │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Router  │  │  Auth    │  │Countries │  │  PDF          │  │
│  │          │  │Middleware│  │Controller│  │  Generator    │  │
│  │/api/auth │  │  (JWT)   │  │          │  │  (pdfkit)     │  │
│  │/api/     │  │          │  │          │  │               │  │
│  │countries │  └──────────┘  └──────────┘  └───────────────┘  │
│  │/health   │                                                   │
│  └──────────┘                                                   │
└──────────┬──────────────────────────────────────────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────┐           ┌──────────────────────┐
│   MongoDB Atlas  │           │  RestCountries API   │
│  (Usuarios/Auth) │           │  (restcountries.com) │
└──────────────────┘           └──────────────────────┘
```

### Flujo de autenticación

```
Frontend                    Backend                   MongoDB
   │                           │                         │
   │── POST /api/auth/login ──►│                         │
   │   { email, password }     │── findOne({ email }) ──►│
   │                           │◄── user document ───────│
   │                           │  bcrypt.compare()        │
   │◄── { token: JWT } ────────│                         │
   │  localStorage.setItem()   │                         │
   │                           │                         │
   │── GET /api/countries ────►│                         │
   │   Authorization: Bearer   │  verifyToken()          │
   │                           │── fetch RestCountries ──►
   │◄── countries[] ───────────│                         │
```

### Estrategia de despliegue en Railway

```
GitHub Repository
├── frontend/   ──► Railway Service: countries-frontend
│                   Build: npm run build
│                   Serve: static files (nginx / serve)
│
└── backend/    ──► Railway Service: countries-backend
                    Start: node src/index.js
                    Env: PORT, JWT_SECRET, MONGO_URI,
                         RESTCOUNTRIES_URL
```

---

## Components and Interfaces

### Frontend

#### Estructura de directorios

```
frontend/
├── src/
│   ├── api/
│   │   └── countriesApi.js       # Funciones fetch hacia el backend
│   ├── components/
│   │   ├── CountryCard.jsx        # Tarjeta individual de país
│   │   ├── SearchBar.jsx          # Barra de búsqueda
│   │   ├── LoadingSpinner.jsx     # Indicador de carga
│   │   └── ProtectedRoute.jsx     # HOC para rutas protegidas
│   ├── pages/
│   │   ├── LoginPage.jsx          # Pantalla de login
│   │   └── HomePage.jsx           # Vista principal con lista de países
│   ├── store/
│   │   └── useCountryStore.js     # Estado global (Zustand)
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── vite.config.js
```

#### Componentes principales

**`CountryCard`**
```
Props:
  country: CountryData
  onDelete: (countryCode: string) => void
  onDownloadPdf: (country: CountryData) => void

Renders:
  - <img> con flags.svg (alt = name.common)
  - <h2> name.common
  - <p> Población: {population.toLocaleString()}
  - <p> Región: {region}
  - <button> Eliminar
  - <button> Descargar PDF
```

**`SearchBar`**
```
Props:
  value: string
  onChange: (text: string) => void

Renders:
  - <input type="text"> con placeholder "Buscar país..."
```

**`ProtectedRoute`**
```
Props:
  children: ReactNode

Behavior:
  - Lee token de localStorage
  - Si no existe → <Navigate to="/login" />
  - Si existe → renderiza children
```

**`HomePage`**
```
State (desde useCountryStore):
  - countries: CountryData[]        # lista filtrada visible
  - allCountries: CountryData[]     # copia original para restaurar
  - searchTerm: string

Actions:
  - fetchCountries()
  - deleteCountry(code)
  - restoreCountries()
  - setSearchTerm(text)

Renders:
  - SearchBar
  - Botón "Restaurar países"
  - Botón "Descargar PDF General"
  - Grid de CountryCard[]
  - Mensajes de estado vacío / error
```

#### API Client (`src/api/countriesApi.js`)

```javascript
// Todas las funciones leen VITE_API_URL del entorno
getCountries()                    // GET /api/countries
downloadSinglePdf(country)        // POST /api/countries/pdf/single → Blob
downloadAllPdf(countries)         // POST /api/countries/pdf/all   → Blob
login(email, password)            // POST /api/auth/login → { token }
```

#### Estado global (`useCountryStore` — Zustand)

```
State:
  allCountries: CountryData[]   # datos originales del backend
  countries: CountryData[]      # lista activa (sin eliminados)
  searchTerm: string
  isLoading: boolean
  error: string | null

Derived (selector):
  filteredCountries: CountryData[]
    = countries.filter(c =>
        c.name.common.toLowerCase()
          .includes(searchTerm.toLowerCase()))

Actions:
  fetchCountries()
  deleteCountry(nameCommon: string)
  restoreCountries()
  setSearchTerm(text: string)
```

---

### Backend

#### Estructura de directorios

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                  # Conexión a MongoDB
│   ├── controllers/
│   │   ├── authController.js      # login()
│   │   └── countriesController.js # getCountries(), pdfSingle(), pdfAll()
│   ├── middleware/
│   │   └── authMiddleware.js      # verifyToken()
│   ├── models/
│   │   └── User.js                # Mongoose schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── countriesRoutes.js
│   ├── services/
│   │   ├── restCountriesService.js # fetch a RestCountries API
│   │   └── pdfService.js           # generación de PDF con pdfkit
│   └── index.js                   # Entry point, Express app
├── .env.example
└── package.json
```

#### Endpoints de la API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/login` | No | Autenticación, retorna JWT |
| GET | `/api/countries` | Sí (JWT) | Lista de países desde RestCountries |
| POST | `/api/countries/pdf/single` | Sí (JWT) | PDF de un país |
| POST | `/api/countries/pdf/all` | Sí (JWT) | PDF de todos los países visibles |

#### Contratos de la API

**POST `/api/auth/login`**
```
Request body:
  { "email": string, "password": string }

Response 200:
  { "token": string }   // JWT, expira en 24h

Response 401:
  { "message": "Credenciales inválidas" }
```

**GET `/api/countries`**
```
Headers:
  Authorization: Bearer <token>

Response 200:
  CountryData[]

Response 504:
  { "message": "External API timeout" }

Response 502:
  { "message": "External API error" }
```

**POST `/api/countries/pdf/single`**
```
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Request body:
  CountryData (name, capital, population, region, flags)

Response 200:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="{name.common}.pdf"
  <binary PDF>

Response 400:
  { "message": "Datos de país inválidos o incompletos" }
```

**POST `/api/countries/pdf/all`**
```
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Request body:
  CountryData[]

Response 200:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="countries-report.pdf"
  <binary PDF>

Response 400:
  { "message": "La lista de países está vacía" }
```

**GET `/health`**
```
Response 200:
  { "status": "ok" }
```

---

## Data Models

### MongoDB — Colección `users`

```javascript
// Mongoose Schema: User.js
{
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },   // bcrypt hash, saltRounds=10
  createdAt: { type: Date, default: Date.now }
}
```

Índices: `email` (unique).

### TypeScript / JSDoc — CountryData

```typescript
interface CountryData {
  name: {
    common:   string;   // "France"
    official: string;   // "French Republic"
  };
  capital:    string[];          // ["Paris"]
  population: number;            // 67391582
  region:     string;            // "Europe"
  flags: {
    svg: string;                 // "https://..."
    png: string;                 // "https://..."
    alt: string;                 // descripción accesible
  };
}
```

Esta interfaz es compartida conceptualmente entre frontend y backend. En el frontend se usa como tipo JSDoc/TypeScript; en el backend se usa para validar el body de las solicitudes PDF.

### JWT Payload

```json
{
  "userId": "<MongoDB ObjectId>",
  "email": "user@example.com",
  "iat": 1700000000,
  "exp": 1700086400
}
```

### Variables de entorno

**Backend (`.env`)**
```
PORT=3001
MONGO_URI=mongodb+srv://...
JWT_SECRET=<secret-aleatorio-256-bits>
RESTCOUNTRIES_URL=https://restcountries.com/v3.1/all?fields=name,capital,population,region,flags
```

**Frontend (`.env`)**
```
VITE_API_URL=http://localhost:3001
```

---

## Correctness Properties

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas del sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquinas.*

### Property 1: Filtrado de búsqueda es case-insensitive y no destruye datos

*Para cualquier* lista de países no vacía y cualquier cadena de búsqueda (incluyendo cadena vacía), el conjunto de países filtrados debe ser un subconjunto de la lista original, y al borrar el término de búsqueda la lista visible debe ser idéntica a la lista original de países no eliminados.

**Validates: Requirements 3.2, 3.3**

---

### Property 2: Eliminación reduce la lista y restauración la repone

*Para cualquier* lista de países y cualquier subconjunto de países eliminados, después de eliminarlos el Country_Store no debe contener ninguno de los países eliminados; y después de restaurar, el Country_Store debe ser igual al conjunto original de países.

**Validates: Requirements 4.2, 4.3, 4.4**

---

### Property 3: Validación de datos de país para PDF individual

*Para cualquier* objeto que represente datos de país, si le falta al menos uno de los campos requeridos (`name`, `capital`, `population`, `region`, `flags`), el endpoint `/api/countries/pdf/single` debe retornar HTTP 400; y si todos los campos están presentes y son válidos, debe retornar HTTP 200 con `Content-Type: application/pdf`.

**Validates: Requirements 5.3, 5.4, 5.6**

---

### Property 4: PDF general rechaza lista vacía y acepta lista no vacía

*Para cualquier* lista de países enviada al endpoint `/api/countries/pdf/all`, si la lista está vacía el backend debe retornar HTTP 400; si la lista contiene al menos un país válido, el backend debe retornar HTTP 200 con `Content-Type: application/pdf`.

**Validates: Requirements 6.3, 6.4, 6.6**

---

### Property 5: Autenticación — credenciales correctas producen JWT válido

*Para cualquier* par (email, password) que corresponda a un usuario existente en la base de datos, el endpoint `/api/auth/login` debe retornar un token JWT que sea verificable con el mismo `JWT_SECRET` y que contenga el `userId` y `email` correctos.

**Validates: Requirements 7.2**

---

### Property 6: Rutas protegidas rechazan tokens inválidos o ausentes

*Para cualquier* solicitud a un endpoint protegido (GET `/api/countries`, POST `/api/countries/pdf/*`) que no incluya un token JWT válido (ausente, expirado o con firma incorrecta), el backend debe retornar HTTP 401 o HTTP 403.

**Validates: Requirements 7.4**

---

### Property 7: Proxy de RestCountries preserva los campos requeridos

*Para cualquier* respuesta válida de la RestCountries API, el endpoint GET `/api/countries` debe retornar un array donde cada elemento contenga los campos `name`, `capital`, `population`, `region` y `flags` sin modificación.

**Validates: Requirements 1.1**

---

## Error Handling

### Frontend

| Situación | Comportamiento |
|-----------|---------------|
| Backend no responde al cargar países | Mostrar `"No se pudieron cargar los países. Intente nuevamente."` |
| Búsqueda sin resultados | Mostrar `"No se encontraron países con ese nombre."` |
| Country_Store vacío tras eliminaciones | Mostrar `"No hay países para mostrar. Restaura la lista para continuar."` |
| Token JWT ausente o expirado | Redirigir a `/login` automáticamente |
| Error al descargar PDF | Mostrar toast/alerta con mensaje de error |
| Campos vacíos en formulario de login | Mostrar mensajes de validación inline sin llamar al backend |
| Credenciales incorrectas (401 del backend) | Mostrar `"Credenciales inválidas"` en el formulario |

### Backend

| Situación | Código HTTP | Mensaje |
|-----------|-------------|---------|
| RestCountries no responde en 10s | 504 | `"External API timeout"` |
| RestCountries retorna 4xx/5xx | 502 | `"External API error"` |
| Token JWT ausente o inválido | 401 | `"Token no proporcionado"` / `"Token inválido"` |
| Credenciales de login incorrectas | 401 | `"Credenciales inválidas"` |
| Datos de país incompletos (PDF single) | 400 | `"Datos de país inválidos o incompletos"` |
| Lista vacía (PDF all) | 400 | `"La lista de países está vacía"` |
| Error interno no controlado | 500 | `"Internal server error"` |

### Estrategia de timeout para RestCountries

El servicio `restCountriesService.js` usará `AbortController` con un timeout de 10 segundos:

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10_000);
try {
  const res = await fetch(RESTCOUNTRIES_URL, { signal: controller.signal });
  // ...
} catch (err) {
  if (err.name === 'AbortError') throw new ApiTimeoutError();
  throw new ApiError(err);
} finally {
  clearTimeout(timeoutId);
}
```

---

## Testing Strategy

### Enfoque dual: pruebas unitarias + pruebas basadas en propiedades

La estrategia combina pruebas de ejemplo (unitarias/integración) para comportamientos concretos y pruebas basadas en propiedades (PBT) para verificar invariantes universales.

### Herramientas

| Capa | Framework de pruebas | PBT Library |
|------|---------------------|-------------|
| Frontend (React) | Vitest + React Testing Library | `fast-check` |
| Backend (Node.js) | Jest (o Vitest) | `fast-check` |

### Pruebas unitarias / de ejemplo

**Frontend**
- `CountryCard` renderiza bandera, nombre, población formateada y región
- `SearchBar` llama a `onChange` en cada keystroke
- `ProtectedRoute` redirige a `/login` cuando no hay token
- `LoginPage` muestra errores de validación con campos vacíos
- `useCountryStore` — `deleteCountry` elimina el país correcto
- `useCountryStore` — `restoreCountries` repone la lista completa
- `useCountryStore` — `filteredCountries` retorna subconjunto correcto

**Backend**
- `authController.login` retorna 401 con credenciales incorrectas
- `authController.login` retorna JWT con credenciales correctas
- `authMiddleware.verifyToken` rechaza token expirado
- `countriesController.getCountries` retorna 504 si RestCountries timeout
- `countriesController.pdfSingle` retorna 400 con datos incompletos
- `countriesController.pdfAll` retorna 400 con lista vacía

### Pruebas basadas en propiedades (PBT)

Cada prueba de propiedad se ejecuta con **mínimo 100 iteraciones** y se etiqueta con el formato:
`Feature: countries-explorer-mern, Property {N}: {texto de la propiedad}`

#### Property 1 — Filtrado de búsqueda
```
Feature: countries-explorer-mern, Property 1: Filtrado de búsqueda es case-insensitive y no destruye datos

Generadores:
  - fc.array(countryArbitrary, { minLength: 1 })
  - fc.string()  // término de búsqueda

Verificación:
  1. filteredCountries ⊆ allCountries
  2. setSearchTerm("") → filteredCountries === countries (sin eliminados)
  3. Filtrado es case-insensitive
```

#### Property 2 — Eliminación y restauración
```
Feature: countries-explorer-mern, Property 2: Eliminación reduce la lista y restauración la repone

Generadores:
  - fc.array(countryArbitrary, { minLength: 2 })
  - fc.subarray(countries)  // subconjunto a eliminar

Verificación:
  1. Después de eliminar: ningún país eliminado aparece en countries
  2. Después de restoreCountries(): countries deepEqual allCountries
```

#### Property 3 — Validación PDF individual
```
Feature: countries-explorer-mern, Property 3: Validación de datos de país para PDF individual

Generadores:
  - fc.record con campos opcionales omitidos aleatoriamente
  - fc.record con todos los campos presentes y válidos

Verificación:
  1. Objeto con campo faltante → HTTP 400
  2. Objeto completo y válido → HTTP 200 + Content-Type: application/pdf
```

#### Property 4 — PDF general
```
Feature: countries-explorer-mern, Property 4: PDF general rechaza lista vacía y acepta lista no vacía

Generadores:
  - fc.constant([])
  - fc.array(countryArbitrary, { minLength: 1 })

Verificación:
  1. Lista vacía → HTTP 400
  2. Lista no vacía → HTTP 200 + Content-Type: application/pdf
```

#### Property 5 — JWT válido para credenciales correctas
```
Feature: countries-explorer-mern, Property 5: Credenciales correctas producen JWT válido

Generadores:
  - fc.emailAddress()
  - fc.string({ minLength: 8 })  // password

Verificación (con usuario mockeado en DB):
  1. jwt.verify(token, JWT_SECRET) no lanza excepción
  2. payload.email === email enviado
  3. payload.exp - payload.iat ≈ 86400 (24h)
```

#### Property 6 — Rutas protegidas rechazan tokens inválidos
```
Feature: countries-explorer-mern, Property 6: Rutas protegidas rechazan tokens inválidos o ausentes

Generadores:
  - fc.oneof(fc.constant(null), fc.string(), expiredTokenArbitrary)

Verificación:
  1. Solicitud sin token → 401
  2. Solicitud con string aleatorio como token → 401/403
  3. Solicitud con token expirado → 401/403
```

#### Property 7 — Proxy preserva campos de RestCountries
```
Feature: countries-explorer-mern, Property 7: Proxy de RestCountries preserva los campos requeridos

Generadores:
  - fc.array(countryArbitrary, { minLength: 1 })  // respuesta mockeada

Verificación (RestCountries mockeada):
  1. Cada elemento del array retornado contiene name, capital, population, region, flags
  2. Los valores son idénticos a los de la respuesta mockeada
```

### Pruebas de integración

- Login end-to-end con MongoDB en memoria (mongodb-memory-server)
- GET `/api/countries` con RestCountries mockeada (nock o msw)
- Health check GET `/health` retorna 200

### Pruebas de humo (smoke tests)

- Variables de entorno requeridas están definidas al iniciar el servidor
- Conexión a MongoDB se establece correctamente al arrancar
