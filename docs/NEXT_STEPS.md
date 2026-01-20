# Próximos Pasos - Recomendaciones

**Estado actual:** Course Service implementado ✅  
**Fecha:** 2026-01-12

---

## 🎯 **RECOMENDACIÓN PRINCIPAL: Expandir Enrollment Service**

### **¿Por qué ahora?**

1. ✅ **Rápido (1-2 horas)** - Solo necesita 2 endpoints nuevos
2. ✅ **Alto impacto** - Desbloquea funcionalidad crítica para frontend
3. ✅ **Depende de Course Service** - Que ya está completo
4. ✅ **Máximo valor** - Permite a estudiantes y docentes ver listados completos

---

## 📋 **OPCIONES DE ACCIÓN (en orden de recomendación)**

### **Opción 1: Expandir Enrollment Service AHORA** ⭐ **RECOMENDADO**

**Qué hacer:**
1. Añadir `GET /api/v1/enrollments/students/:studentId` - Ver todas las materias del estudiante
2. Añadir `GET /api/v1/enrollments/courses/:courseId` - Ver estudiantes de un curso
3. Expandir responses con detalles de cursos (usando course-service)

**Impacto inmediato:**
- ✅ Dashboard estudiante: puede ver sus materias con detalles completos
- ✅ Dashboard docente: puede ver todos los estudiantes de cada curso
- ✅ Frontend puede mostrar información completa en listados

**Tiempo:** 1-2 horas  
**Complejidad:** Baja

---

### **Opción 2: Probar Course Service primero**

**Qué hacer:**
1. Instalar dependencias: `cd apps/course-service && npm install`
2. Generar Prisma client: `npm run prisma:generate`
3. Crear migración: `npx prisma migrate dev --name init`
4. Levantar servicios: `docker compose -f infra/docker/docker-compose.local.yml up postgres-course course-service`
5. Probar endpoints en Swagger: `http://localhost:3004/api/docs`

**Cuándo hacerlo:** Ahora o después de expandir Enrollment

---

### **Opción 3: Continuar con Material Service**

**Qué hacer:**
Implementar Material Service completo desde cero (4-6 horas)

**Cuándo hacerlo:** Después de Enrollment Service

**Motivo:** Material Service es más crítico que Tutoring pero requiere más tiempo

---

### **Opción 4: Implementar Tutoring Service**

**Qué hacer:**
Implementar Tutoring Service completo desde cero (4-6 horas)

**Cuándo hacerlo:** Después de Material Service

---

## 🎯 **MI RECOMENDACIÓN ESPECÍFICA**

### **PASO 1: Expandir Enrollment Service (AHORA)** ⭐

**Razones:**
- Es **rápido** (1-2 horas)
- **Alto impacto** - Desbloquea funcionalidad crítica
- Ya tienes toda la infraestructura lista
- Permite que el frontend muestre información completa

**Qué implementar:**
```
GET /api/v1/enrollments/students/:studentId
→ Retorna: Lista de cursos del estudiante con detalles completos

GET /api/v1/enrollments/courses/:courseId  
→ Retorna: Lista de estudiantes del curso con información básica
```

---

### **PASO 2: Probar ambos servicios (después)**

Levantar y probar:
- Course Service: CRUD de cursos
- Enrollment Service: Matricular + listar

---

### **PASO 3: Material Service (siguiente)**

Una vez que Enrollment esté expandido, implementar Material Service para completar el flujo:
- Docentes pueden subir materiales
- Estudiantes pueden ver materiales por materia

---

## 📊 **IMPACTO POR OPCIÓN**

| Opción | Tiempo | Impacto Frontend | Complejidad | Recomendación |
|--------|--------|------------------|-------------|---------------|
| **Expandir Enrollment** | 1-2h | ⭐⭐⭐⭐⭐ | Baja | ✅ **HACER AHORA** |
| Probar Course Service | 30min | - | Baja | Hacer después |
| Material Service | 4-6h | ⭐⭐⭐⭐⭐ | Media | Siguiente |
| Tutoring Service | 4-6h | ⭐⭐⭐ | Media-Alta | Después |

---

## ✅ **CHECKLIST POST-EXPANSIÓN ENROLLMENT**

Después de expandir Enrollment Service tendrás:

- [x] Course Service completo ✅
- [ ] Enrollment Service expandido (2 endpoints nuevos)
- [ ] Estudiantes pueden ver todas sus materias con detalles
- [ ] Docentes pueden ver todos los estudiantes por curso
- [ ] Frontend puede mostrar información completa

**Progreso total: ~75% funcional** 🎉

---

## 🚀 **ACCIÓN INMEDIATA RECOMENDADA**

**Expandir Enrollment Service ahora mismo** porque:
1. Es rápido y de alto impacto
2. Desbloquea funcionalidad crítica
3. Ya tienes Course Service listo como dependencia
4. Permite que el frontend sea mucho más funcional

**¿Procedemos con Enrollment Service expansion?** 🚀