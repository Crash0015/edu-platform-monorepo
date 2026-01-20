# Capacidades de Frontend - Lo que PUEDES y NO PUEDES hacer actualmente

**Fecha:** 2026-01-12  
**Estado:** Análisis de endpoints implementados vs funcionalidades deseadas

---

## 🎯 Resumen Ejecutivo

Con lo que tienes implementado actualmente, puedes construir aproximadamente **60-70%** de las funcionalidades que mencionas. Algunas cosas funcionan completamente, otras parcialmente, y algunas requieren implementación adicional en los servicios backend.

---

## ✅ **LO QUE SÍ PUEDES HACER COMPLETAMENTE**

### 1. **Página General Pública** ✅
- ✅ Crear landing page pública
- ✅ Mostrar información general de la plataforma
- ✅ Mostrar información institucional (UCE)

**Limitaciones:** Solo contenido estático. No hay endpoints para contenido dinámico público.

---

### 2. **Sistema de Autenticación Completo** ✅

#### **Para Todos los Usuarios:**
- ✅ **Login** con email @uce.edu.ec
  - Endpoint: `POST /api/v1/auth/login`
  - Validación de dominio institucional
  
- ✅ **Registro** de nuevos usuarios
  - Endpoint: `POST /api/v1/auth/register`
  - Solo emails @uce.edu.ec aceptados
  
- ✅ **Reset Password** (Olvidé mi contraseña)
  - Endpoint: `POST /api/v1/auth/password/forgot`
  - Endpoint: `POST /api/v1/auth/password/reset`
  
- ✅ **MFA (Multi-Factor Authentication)**
  - ✅ Habilitar MFA: `POST /api/v1/auth/mfa/setup`
  - ✅ Verificar MFA: `POST /api/v1/auth/mfa/verify`
  - ✅ Deshabilitar MFA: `POST /api/v1/auth/mfa/disable`
  - ✅ Login con MFA: `POST /api/v1/auth/login/mfa`
  
- ✅ **Perfil de Usuario Básico**
  - Endpoint: `GET /api/v1/auth/me`
  - Retorna: `id`, `email`, `roles`, `mfaEnabled`, `status`
  
- ✅ **Refresh Token** y **Logout**
  - Endpoint: `POST /api/v1/auth/refresh`
  - Endpoint: `POST /api/v1/auth/logout`

**✅ TODO ESTO FUNCIONA COMPLETAMENTE**

---

### 3. **Dashboard de Docente - Parcial** ⚠️

#### **Lo que SÍ funciona:**
- ✅ **Matricular Estudiantes**
  - Endpoint: `POST /api/v1/enrollments/assign`
  - Requiere: JWT con rol `TEACHER`
  - Parámetros: `studentId`, `courseId`
  - Validaciones: Estudiante activo, curso con cupos disponibles

#### **Lo que FALTA:**
- ❌ **Listar Estudiantes por Materia**
  - No hay endpoint para obtener lista de estudiantes matriculados en un curso
  - Necesitas: `GET /api/v1/enrollments/courses/:courseId/students`
  
- ❌ **Listar Cursos del Docente**
  - No hay endpoint para ver qué cursos enseña un docente
  - Necesitas: `GET /api/v1/courses/teachers/:teacherId` o similar

---

### 4. **Dashboard de Estudiante - Parcial** ⚠️

#### **Lo que SÍ funciona:**
- ✅ **Ver Materias Matriculadas**
  - Endpoint: `GET /api/v1/search/enrollments/:studentId`
  - Retorna lista de cursos en los que está matriculado
  - Formato: `{ studentId, enrollments: [{ courseId, status }] }`

#### **Lo que FALTA:**
- ❌ **Ver Detalles de Materias**
  - Solo puedes obtener `courseId`, no nombre, descripción, etc.
  - Necesitas: Expandir `course-service` o hacer múltiples requests
  
- ❌ **Ver Materiales por Materia**
  - `material-service` NO está implementado
  - Necesitas: Implementar material-service completamente
  
- ❌ **Reservar Tutorías**
  - `tutoring-service` NO está implementado
  - Necesitas: Implementar tutoring-service completamente

---

## ❌ **LO QUE NO PUEDES HACER (FALTA IMPLEMENTAR)**

### 1. **Gestión de Materiales** ❌
**Estado:** `material-service` existe pero está vacío

**Lo que necesitas implementar:**
- ❌ `POST /api/v1/materials` - Subir material (docente)
- ❌ `GET /api/v1/materials/courses/:courseId` - Listar materiales por curso
- ❌ `GET /api/v1/materials/:id` - Ver detalle de material
- ❌ `DELETE /api/v1/materials/:id` - Eliminar material
- ❌ Organización por secciones/temas

**Recomendación:** Este es crítico para tu funcionalidad. Necesitas implementarlo o usar Strapi directamente.

---

### 2. **Sistema de Tutorías** ❌
**Estado:** Solo estructura básica, sin endpoints

**Lo que necesitas implementar:**
- ❌ `GET /api/v1/tutoring/availability` - Ver horarios disponibles
- ❌ `POST /api/v1/tutoring/bookings` - Reservar tutoría (estudiante)
- ❌ `GET /api/v1/tutoring/bookings/student/:studentId` - Ver mis reservas (estudiante)
- ❌ `GET /api/v1/tutoring/bookings/teacher/:teacherId` - Ver reservas (docente)
- ❌ `PATCH /api/v1/tutoring/bookings/:id` - Cancelar/modificar reserva

---

### 3. **CRUD Completo de Cursos** ❌
**Estado:** Solo `GET /api/v1/courses/:id` implementado

**Lo que falta:**
- ❌ `GET /api/v1/courses` - Listar todos los cursos
- ❌ `POST /api/v1/courses` - Crear curso (admin/docente)
- ❌ `PATCH /api/v1/courses/:id` - Actualizar curso
- ❌ `DELETE /api/v1/courses/:id` - Eliminar curso
- ❌ `GET /api/v1/courses/teachers/:teacherId` - Cursos de un docente
- ❌ Información completa: nombre, código, descripción, horarios

**Nota:** Actualmente `course-service` solo tiene datos hardcodeados en memoria.

---

### 4. **Gestión de Enrollments (Mejoras)** ⚠️
**Estado:** Solo creación implementada

**Lo que falta:**
- ❌ `GET /api/v1/enrollments/students/:studentId` - Ver todas las materias del estudiante
- ❌ `GET /api/v1/enrollments/courses/:courseId` - Ver estudiantes de un curso
- ❌ `PATCH /api/v1/enrollments/:id/status` - Cambiar status (ACTIVE/DROPPED)
- ❌ Historial de enrollments

---

### 5. **Panel de Administrador** ❌
**Estado:** No hay endpoints específicos de admin

**Lo que falta:**
- ❌ `GET /api/v1/admin/users` - Listar todos los usuarios
- ❌ `PATCH /api/v1/admin/users/:id/status` - Suspender/activar usuarios
- ❌ `GET /api/v1/admin/users/:id` - Ver detalle de usuario
- ❌ `GET /api/v1/admin/statistics` - Estadísticas generales
- ❌ Gestión de roles

**Nota:** Puedes usar `GET /api/v1/users/:id` pero es muy limitado.

---

## 📋 **PLAN DE ACCIÓN - Qué Implementar para Completar Frontend**

### 🔴 **PRIORIDAD CRÍTICA (Para que funcione el flujo básico)**

#### 1. **Course Service - Expandir CRUD**
```typescript
// Necesitas añadir:
GET    /api/v1/courses                    // Listar todos
POST   /api/v1/courses                    // Crear curso
GET    /api/v1/courses/:id                // ✅ Ya existe
PATCH  /api/v1/courses/:id                // Actualizar
DELETE /api/v1/courses/:id                // Eliminar
GET    /api/v1/courses/teachers/:teacherId // Cursos del docente
```

**Archivos a modificar:**
- `apps/course-service/src/presentation/courses.controller.ts`
- `apps/course-service/src/application/courses.service.ts`
- Añadir Prisma schema para persistencia

---

#### 2. **Enrollment Service - Añadir Queries**
```typescript
// Necesitas añadir:
GET /api/v1/enrollments/students/:studentId  // Materias del estudiante
GET /api/v1/enrollments/courses/:courseId    // Estudiantes del curso
```

**Archivos a modificar:**
- `apps/enrollment-service/src/presentation/enrollments/enrollment.controller.ts`
- `apps/enrollment-service/src/application/enrollments/enrollment.service.ts`

---

#### 3. **Material Service - Implementar Completamente** ⚠️ **CRÍTICO**
```typescript
// Implementar desde cero:
POST   /api/v1/materials                          // Subir material
GET    /api/v1/materials/courses/:courseId        // Listar por curso
GET    /api/v1/materials/:id                      // Ver detalle
DELETE /api/v1/materials/:id                      // Eliminar
PATCH  /api/v1/materials/:id                      // Actualizar
```

**Archivos a crear:**
- `apps/material-service/src/presentation/materials/materials.controller.ts`
- `apps/material-service/src/application/materials/materials.service.ts`
- Prisma schema o integración con Strapi

---

### 🟡 **PRIORIDAD ALTA (Funcionalidades clave)**

#### 4. **Tutoring Service - Implementar Completamente**
```typescript
// Implementar desde cero:
GET    /api/v1/tutoring/availability/:teacherId   // Horarios disponibles
POST   /api/v1/tutoring/bookings                  // Reservar
GET    /api/v1/tutoring/bookings/student/:id      // Mis reservas
GET    /api/v1/tutoring/bookings/teacher/:id      // Reservas del docente
PATCH  /api/v1/tutoring/bookings/:id              // Cancelar
```

---

#### 5. **User Service - Expandir Perfil**
```typescript
// Mejorar:
GET    /api/v1/users/:id                // ✅ Ya existe pero limitado
PATCH  /api/v1/users/:id                // Actualizar perfil
GET    /api/v1/users/me                 // Perfil del usuario autenticado
```

---

### 🟢 **PRIORIDAD MEDIA (Panel Admin)**

#### 6. **Admin Endpoints** (nuevo módulo o servicio)
```typescript
// Crear en auth-service o user-service:
GET    /api/v1/admin/users              // Listar usuarios
GET    /api/v1/admin/users/:id          // Ver detalle
PATCH  /api/v1/admin/users/:id/status   // Cambiar status
GET    /api/v1/admin/statistics         // Estadísticas
```

---

## 🎨 **ARQUITECTURA DE FRONTEND SUGERIDA**

### **Estructura de Rutas**

```
/ (Pública)
  └── Landing page con información general

/auth (Pública)
  ├── /login
  ├── /register
  ├── /forgot-password
  └── /reset-password

/dashboard (Protegido - Requiere JWT)
  ├── /student (ROL: STUDENT)
  │   ├── /courses (Ver materias matriculadas) ✅ PARCIAL
  │   ├── /materials (Ver materiales) ❌ FALTA
  │   ├── /tutoring (Reservar tutorías) ❌ FALTA
  │   └── /profile (Perfil) ✅ FUNCIONA
  │
  ├── /teacher (ROL: TEACHER)
  │   ├── /courses (Listar mis cursos) ⚠️ FALTA ENDPOINT
  │   ├── /enrollments (Matricular estudiantes) ✅ FUNCIONA
  │   ├── /students/:courseId (Ver estudiantes) ⚠️ FALTA ENDPOINT
  │   ├── /materials (Subir materiales) ❌ FALTA
  │   └── /profile (Perfil) ✅ FUNCIONA
  │
  └── /admin (ROL: ADMIN)
      ├── /users (Gestionar usuarios) ❌ FALTA
      ├── /courses (Gestionar cursos) ⚠️ PARCIAL
      └── /statistics (Estadísticas) ❌ FALTA
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN FRONTEND**

### **Fase 1: Autenticación (100% Listo)** ✅
- [x] Página de login
- [x] Página de registro
- [x] Reset password
- [x] Configuración MFA
- [x] Perfil básico de usuario

### **Fase 2: Dashboard Estudiante (30% Listo)**
- [x] Ver materias matriculadas (parcial - solo IDs)
- [ ] Ver detalles de materias (falta expandir course-service)
- [ ] Ver materiales por materia (falta material-service)
- [ ] Reservar tutorías (falta tutoring-service)

### **Fase 3: Dashboard Docente (20% Listo)**
- [x] Matricular estudiantes
- [ ] Listar mis cursos (falta endpoint)
- [ ] Ver estudiantes por curso (falta endpoint)
- [ ] Subir materiales (falta material-service)

### **Fase 4: Panel Admin (0% Listo)**
- [ ] Listar usuarios
- [ ] Gestionar usuarios
- [ ] Estadísticas
- [ ] Gestionar cursos

---

## 🚀 **RECOMENDACIÓN INMEDIATA**

Para que tu frontend sea funcional **AHORA MISMO**, implementa en este orden:

1. **Expandir Course Service** (2-3 horas)
   - Añadir `GET /courses` con información completa
   - Conectar con base de datos real (Prisma)
   
2. **Expandir Enrollment Service** (1-2 horas)
   - Añadir `GET /enrollments/students/:studentId`
   - Añadir `GET /enrollments/courses/:courseId`

3. **Implementar Material Service Mínimo** (4-6 horas)
   - CRUD básico de materiales
   - Relación con cursos
   
4. **Implementar Tutoring Service Mínimo** (4-6 horas)
   - Reservas básicas
   - Horarios disponibles

Con estos 4 puntos, tendrás **80-90%** de funcionalidad para un MVP funcional.

---

## 📝 **NOTAS IMPORTANTES**

1. **API Gateway:** Asegúrate de que todas las rutas pasen por `api-gateway` para tener autenticación centralizada.

2. **JWT y Roles:** El sistema de autenticación está completo, así que puedes proteger rutas basado en roles:
   - `STUDENT` → Dashboard estudiante
   - `TEACHER` → Dashboard docente
   - `ADMIN` → Panel admin

3. **Estado Actual:** Muchos servicios tienen datos mock/hardcodeados. Necesitas conectar con bases de datos reales para producción.

4. **Notifications:** El `notification-service` está implementado y puede enviar notificaciones cuando se crean enrollments (vía Kafka), pero no hay endpoints para que el frontend las liste.

---

**Última actualización:** 2026-01-12