# Trabajo Práctico: Autenticación OAuth2 con Google en NestJS

Microservicio backend desarrollado con **NestJS** que implementa el flujo completo de registro y autenticación de usuarios mediante **Google OAuth2**, con persistencia híbrida (usuarios locales + federados) y emisión de **JWT** para proteger rutas privadas.

---

## 🚀 Tecnologías utilizadas

| Tecnología | Rol |
|------------|-----|
| **NestJS** | Framework backend (arquitectura modular) |
| **TypeScript** | Lenguaje |
| **Passport.js** | Middleware de autenticación (`passport-google-oauth20`, `passport-jwt`) |
| **Prisma ORM 7** | Acceso a base de datos |
| **PostgreSQL** | Base de datos relacional |
| **JWT** | Sesiones sin estado (`@nestjs/jwt`) |
| **dotenv** | Carga de variables de entorno |

---

## 📋 Requisitos previos

- **Node.js** v18 o superior
- **PostgreSQL** corriendo localmente (o en Docker)
- Una cuenta de **Google Cloud Console** con credenciales OAuth 2.0 configuradas

---

## 🔧 Configuración de Google Cloud Console

1. Crear un proyecto en [Google Cloud Console](https://console.cloud.google.com/).
2. Configurar la **pantalla de consentimiento de OAuth** (tipo *External*).
3. Crear credenciales → **ID de cliente OAuth 2.0** → *Aplicación web*.
4. Configurar:
   - **Orígenes JavaScript autorizados**: `http://localhost:3000`
   - **URIs de redireccionamiento autorizados**: `http://localhost:3000/auth/google/redirect`
5. Agregar los scopes: `userinfo.email`, `userinfo.profile`, `openid`.
6. Copiar el **Client ID** y el **Client Secret**.

---

## 🛠️ Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO_GITHUB/nestjs-google-oauth.git
cd nestjs-google-oauth
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `JWT_SECRET`.

### 4. Crear la base de datos y aplicar migraciones

```bash
psql -U postgres -c "CREATE DATABASE nestjs_oauth;"
npx prisma migrate dev --name init
```

### 5. Iniciar el servidor

```bash
npm run start:dev
```

La API queda disponible en: **http://localhost:3000**

---

## 🔌 Endpoints

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|----------------|
| `GET` | `/auth/google` | Inicia el flujo OAuth con Google | No |
| `GET` | `/auth/google/redirect` | Callback que procesa la respuesta de Google y emite el JWT | No |
| `GET` | `/auth/me` | Devuelve el usuario autenticado | **Sí** (Bearer JWT) |

### Ejemplo de uso

1. Abrir: `http://localhost:3000/auth/google`
2. Autenticarse con Google.
3. Copiar el JWT de la URL de redirección.
4. Probar la ruta protegida:

```bash
curl http://localhost:3000/auth/me -H "Authorization: Bearer <JWT>"
```

Respuesta:

```json
{
  "userId": "d2c87fca-40d4-4cb1-a7ea-09de17f72d3e",
  "email": "usuario@example.com",
  "provider": "GOOGLE"
}
```

---

## 🗂️ Estructura del proyecto

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── google.strategy.ts
│   └── jwt.strategy.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.module.ts
└── main.ts
```

---

## 🗄️ Modelo de datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `email` | String único | Email (control de duplicados) |
| `password` | String? | Hash de contraseña (solo usuarios locales) |
| `firstName` / `lastName` | String? | Datos del perfil |
| `picture` | String? | URL del avatar |
| `googleId` | String? único | ID de Google (solo usuarios federados) |
| `provider` | Enum | `LOCAL` o `GOOGLE` |
| `createdAt` / `updatedAt` | DateTime | Auditoría |

---

## 🔐 Flujo de autenticación

1. El cliente visita `/auth/google`.
2. Passport redirige a Google.
3. El usuario autoriza.
4. Google redirige a `/auth/google/redirect`.
5. `GoogleStrategy.validate()` procesa el perfil.
6. `AuthService` aplica la lógica híbrida (busca por googleId, luego por email, o crea).
7. Se firma un **JWT** con `id`, `email` y `provider`.
8. El token se devuelve al frontend o se usa para proteger rutas.

---

## 📝 Scripts disponibles

```bash
npm run start:dev      # Modo desarrollo (hot-reload)
npm run start          # Modo normal
npm run build          # Compilar
npm run start:prod     # Ejecutar build
npx prisma studio      # UI de base de datos
npx prisma migrate dev # Aplicar cambios de schema
npx prisma generate    # Regenerar cliente Prisma
```

---

## 👤 Autor

- **Nombre**: Luciano Cejas
- **Email**: luciano_cejas@hotmail.com.ar
- **Materia**: Programación IV
- **Docente**: Martin Rossi
- **Año**: 2026