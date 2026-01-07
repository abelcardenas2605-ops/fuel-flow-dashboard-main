# ⛽ Gas Station Management System

Sistema de Gestión de Estaciones de Servicio desarrollado como **prueba técnica**, diseñado para administrar de forma integral las operaciones de una gasolinera mediante una arquitectura **full‑stack moderna**, segura y escalable.

Este proyecto demuestra buenas prácticas de desarrollo frontend y backend, separación de responsabilidades, autenticación basada en roles y una experiencia de usuario clara tanto para administradores como para consumidores.

---

## 📌 Objetivo del Proyecto

El objetivo principal del sistema es centralizar y digitalizar las operaciones diarias de una estación de servicio, permitiendo:

* Gestión de usuarios con distintos roles (Administrador y Consumidor)
* Control de ventas de combustible
* Administración de tipos de combustible y precios
* Registro de vehículos por consumidor
* Visualización de historiales y reportes
* Autenticación y autorización seguras

---

## 🛠️ Stack Tecnológico

### Frontend

* **Framework**: React + Vite
* **Lenguaje**: TypeScript
* **Estilos**: Tailwind CSS
* **UI Components**: shadcn/ui (Radix UI)
* **Iconos**: Lucide React
* **Routing**: react-router-dom
* **Estado Global**: Context API (Autenticación)
* **Data Fetching**: @tanstack/react-query

El frontend está diseñado con un enfoque **component‑driven**, priorizando reutilización, accesibilidad y una UI moderna.

---

### Backend

* **Framework**: NestJS
* **Lenguaje**: TypeScript
* **ORM**: Prisma
* **Base de Datos**: PostgreSQL
* **Autenticación**: JWT + Passport
* **Documentación**: Swagger

El backend sigue una **arquitectura modular**, alineada con las mejores prácticas de NestJS, facilitando escalabilidad y mantenimiento.

---

### DevOps & Deployment

* **Docker**: Contenerización de PostgreSQL
* **Docker Compose**: Orquestación local
* **Render**: Despliegue de frontend y backend

---

## 🏗️ Arquitectura del Sistema

### Backend – Arquitectura Modular

El sistema está organizado en módulos independientes que encapsulan su lógica de negocio:

* **Auth Module**

  * Autenticación mediante JWT
  * Uso de Passport con estrategia JWT
  * Emisión de tokens con información de rol
  * Guards personalizados (`JwtAuthGuard`, `RolesGuard`)

* **Users Module**

  * CRUD de usuarios
  * Gestión de perfiles (ADMIN / CONSUMER)

* **Fuel Module**

  * Administración de tipos de combustible
  * Actualización de precios

* **Transactions Module**

  * Registro de ventas de combustible
  * Asociación a usuarios y vehículos

* **Vehicles Module**

  * Gestión de vehículos por consumidor

* **Shifts Module**

  * Control de turnos (si aplica)

* **Notifications Module**

  * Envío de alertas o notificaciones del sistema

---

### Frontend – Estructura y Navegación

El frontend diferencia claramente la experiencia entre **Administrador** y **Consumidor**.

#### 📁 Estructura de Carpetas

```
src/
 ├── components/
 │   ├── ui/          # Componentes base (shadcn/ui)
 │   ├── layout/      # Layouts generales (AdminLayout)
 ├── pages/
 │   ├── admin/       # Dashboard, Reportes, Usuarios, Caja
 │   ├── consumer/    # Historial, Precios, Perfil
 ├── contexts/
 │   └── AuthContext  # Manejo de sesión y token
```

#### 🔑 Componentes Clave

* **AdminLayout**: Sidebar + Header para navegación administrativa
* **ProtectedRoute**: Protección de rutas por autenticación y rol

---

## 🔐 Autenticación y Autorización

* Login basado en credenciales
* Emisión de JWT
* Persistencia de sesión en frontend
* Acceso a rutas restringido por rol

Roles implementados:

* **ADMIN**: Acceso completo al sistema
* **CONSUMER**: Acceso limitado a historial, perfil y precios

---

## 🚀 Ejecución Local

### Prerrequisitos

* Node.js v18+
* Docker & Docker Compose
* Git

---

### Pasos de Instalación

1️⃣ **Clonar repositorio**

```bash
git clone <URL_DEL_REPOSITORIO>
cd nombre-del-proyecto
```

2️⃣ **Configurar variables de entorno (Backend)**

```bash
cd backend
cp .env.example .env
```

Configurar correctamente `DATABASE_URL`.

3️⃣ **Levantar base de datos**

```bash
docker-compose up -d
```

4️⃣ **Iniciar Backend**

```bash
npm install
npx prisma migrate dev
npm run start:dev
```

Backend disponible en:

```
http://localhost:3000
```

5️⃣ **Iniciar Frontend**

```bash
npm install
npm run dev
```

Frontend disponible en:

```
http://localhost:8080
```

---

## 🐳 Comandos Docker Útiles

```bash
docker-compose up -d      # Iniciar servicios
docker-compose down       # Detener servicios
docker-compose logs -f    # Ver logs
```

---

## 📄 Licencia

Proyecto privado desarrollado exclusivamente con fines **demostrativos y de evaluación técnica**.

---

## ✨ Notas Finales

Este proyecto refleja:

* Buenas prácticas en arquitectura full‑stack
* Uso moderno del ecosistema React y NestJS
* Seguridad basada en roles
* Código escalable y mantenible

Ideal como base para un sistema real de gestión de estaciones de servicio o como demostración técnica profesional.
