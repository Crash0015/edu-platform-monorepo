# Plan de Implementación - Roadmap Funcional

**Objetivo:** Implementar servicios faltantes para tener una plataforma 100% funcional  
**Estrategia:** Implementar en orden de dependencias y valor para el frontend

---

## 🎯 **ORDEN RECOMENDADO DE IMPLEMENTACIÓN**

### **1️⃣ COURSE SERVICE (PRIORIDAD CRÍTICA)** ⭐ **EMPEZAR AQUÍ**

**¿Por qué primero?**
- ✅ Es la **base de todo** el sistema
- ✅ Sin cursos completos, los estudiantes no pueden ver detalles
- ✅ Los docentes necesitan ver sus cursos para matricular
- ✅ `enrollment-service` ya depende de él (lo usa para validar cupos)
- ✅ Es relativamente simple de expandir (solo necesita Prisma + CRUD)
- ✅ **Desbloquea 40% más de funcionalidad** inmediatamente

**Estado actual:**
- ❌ Solo tiene datos hardcodeados en memoria (Map)
- ❌ Solo tiene `GET /:id` 
- ❌ No tiene base de datos
- ❌ No tiene Prisma configurado

**Qué implementar:**
1. Configurar Prisma con schema de courses
2. CRUD completo (POST, GET, PATCH, DELETE)
3. Queries: listar cursos, cursos por docente
4. Integración con base de datos PostgreSQL
5. Eventos Kafka al crear/actualizar cursos

**Tiempo estimado:** 3-4 horas  
**Impacto:** ⭐⭐⭐⭐⭐ (Alto)

---

### **2️⃣ ENROLLMENT SERVICE - Expandir Queries** (PRIORIDAD ALTA)

**¿Por qué segundo?**
- ✅ Ya existe y funciona parcialmente
- ✅ Solo necesita añadir endpoints de consulta
- ✅ Depende de Course Service (que ya estará completo)
- ✅ Desbloquea funcionalidad de listados

**Estado actual:**
- ✅ Tiene creación de enrollments (POST /assign)
- ✅ Tiene validaciones y eventos Kafka
- ❌ Falta: GET para listar estudiantes por curso
- ❌ Falta: GET para listar cursos por estudiante

**Qué implementar:**
1. `GET /api/v1/enrollments/courses/:courseId` - Estudiantes de un curso
2. `GET /api/v1/enrollments/students/:studentId` - Cursos de un estudiante
3. Expandir response con detalles de cursos (usando course-service)

**Tiempo estimado:** 1-2 horas  
**Impacto:** ⭐⭐⭐⭐ (Medio-Alto)

---

### **3️⃣ MATERIAL SERVICE** (PRIORIDAD ALTA)

**¿Por qué tercero?**
- ✅ Es crítico para el flujo estudiantil
- ✅ Los docentes necesitan subir materiales
- ✅ Los estudiantes necesitan ver materiales
- ⚠️ Actualmente está completamente vacío

**Estado actual:**
- ❌ Solo estructura de carpetas vacía
- ❌ No tiene endpoints
- ❌ No tiene lógica de negocio

**Qué implementar:**
1. Schema Prisma para materiales (o integración Strapi)
2. CRUD completo de materiales
3. Relación con cursos
4. Upload de archivos (S3 o local)
5. Organización por secciones/temas

**Tiempo estimado:** 4-6 horas  
**Impacto:** ⭐⭐⭐⭐⭐ (Alto)

---

### **4️⃣ TUTORING SERVICE** (PRIORIDAD MEDIA)

**¿Por qué cuarto?**
- ✅ Importante pero no crítico para MVP
- ✅ Depende menos de otros servicios
- ✅ Puede implementarse de forma independiente

**Estado actual:**
- ❌ Solo estructura básica
- ❌ No tiene endpoints implementados

**Qué implementar:**
1. Schema Prisma para tutorías
2. CRUD de disponibilidad (docente)
3. Sistema de reservas (estudiante)
4. Validaciones de horarios
5. Estados de reservas

**Tiempo estimado:** 4-6 horas  
**Impacto:** ⭐⭐⭐ (Medio)

---

## 📊 **IMPACTO POR PRIORIDAD**

| Servicio | Tiempo | Impacto Frontend | Complejidad | Dependencias |
|----------|--------|------------------|-------------|--------------|
| **Course Service** | 3-4h | ⭐⭐⭐⭐⭐ | Baja | Ninguna |
| **Enrollment (expandir)** | 1-2h | ⭐⭐⭐⭐ | Baja | Course Service |
| **Material Service** | 4-6h | ⭐⭐⭐⭐⭐ | Media | Course Service |
| **Tutoring Service** | 4-6h | ⭐⭐⭐ | Media-Alta | Ninguna |

---

## 🚀 **PLAN DE ACCIÓN INMEDIATO**

### **Fase 1: Course Service (HOY)**
1. Configurar Prisma
2. Crear schema de courses
3. Implementar CRUD completo
4. Añadir queries (listar, por docente)
5. Eventos Kafka

**Resultado:** Docentes pueden ver sus cursos, estudiantes pueden ver detalles de materias

---

### **Fase 2: Enrollment Queries (HOY/TMAÑANA)**
1. Añadir endpoint estudiantes por curso
2. Añadir endpoint cursos por estudiante
3. Expandir responses con detalles

**Resultado:** Listados completos funcionando

---

### **Fase 3: Material Service (TMAÑANA)**
1. Implementar desde cero
2. CRUD completo
3. Upload de archivos

**Resultado:** Sistema completo de materiales funcionando

---

### **Fase 4: Tutoring Service (DESPUÉS)**
1. Implementar desde cero
2. Sistema de reservas

**Resultado:** Funcionalidad completa de tutorías

---

## ✅ **CHECKLIST DE FUNCIONALIDAD POST-IMPLEMENTACIÓN**

### **Dashboard Estudiante:**
- [x] Login/Registro/Reset Password/MFA
- [x] Ver materias matriculadas (parcial - solo IDs)
- [ ] Ver detalles completos de materias ✅ **Después de Course Service**
- [ ] Ver materiales por materia ✅ **Después de Material Service**
- [ ] Reservar tutorías ✅ **Después de Tutoring Service**

### **Dashboard Docente:**
- [x] Login/Registro/Reset Password/MFA
- [x] Matricular estudiantes
- [ ] Ver mis cursos ✅ **Después de Course Service**
- [ ] Ver estudiantes por curso ✅ **Después de Enrollment expandido**
- [ ] Subir materiales ✅ **Después de Material Service**

---

## 🎯 **RECOMENDACIÓN FINAL**

**EMPEZAR CON COURSE SERVICE** porque:

1. ✅ Es la base de todo
2. ✅ Desbloquea funcionalidad en múltiples servicios
3. ✅ Es relativamente rápido de implementar
4. ✅ Tiene impacto inmediato en frontend
5. ✅ Permite que enrollment-service funcione mejor
6. ✅ Los docentes pueden empezar a trabajar

**Después de Course Service, tendrás:**
- 70% de funcionalidad básica funcionando
- Dashboard de docente 60% funcional
- Dashboard de estudiante 50% funcional

**Con Material Service adicional:**
- 85% de funcionalidad funcionando
- Sistema completamente usable

---

**¿Comenzamos con Course Service?** 🚀