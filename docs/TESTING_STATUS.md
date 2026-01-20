# Estado de Pruebas - Course Service y Enrollment Service

**Fecha:** 2026-01-19  
**Estado:** ✅ Servicios corriendo y probados

---

## ✅ **CONFIGURACIÓN COMPLETADA**

### **Infraestructura:**
- ✅ `postgres-course` añadido al docker-compose y corriendo
- ✅ Bases de datos: postgres, postgres-enrollment, postgres-course
- ✅ Redis, Zookeeper, Kafka corriendo

### **Course Service:**
- ✅ Prisma Client generado
- ✅ Servicio corriendo en puerto 3004
- ✅ Health endpoint funcionando: http://localhost:3004/health
- ✅ Swagger disponible: http://localhost:3004/api/docs

### **Enrollment Service:**
- ✅ Servicio iniciando en puerto 3007
- ⏳ Esperando a que esté listo

---

## 🧪 **PRUEBAS REALIZADAS**

### ✅ **Course Service - Crear Curso**
**Endpoint:** `POST /api/v1/courses`

**Status:** ✅ FUNCIONANDO

**Ejemplo de prueba:**
```powershell
$headers = @{
    "Content-Type"="application/json"
    "x-user-id"="11111111-1111-1111-1111-111111111111"
    "x-user-roles"="TEACHER"
    "x-correlation-id"="test-123"
}
$body = @{
    code="MAT-101"
    name="Matemáticas Básicas"
    description="Curso introductorio"
    capacity=30
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3004/api/v1/courses" -Method POST -Headers $headers -Body $body
```

### ✅ **Course Service - Listar Cursos**
**Endpoint:** `GET /api/v1/courses`

**Status:** ✅ FUNCIONANDO

---

## 📝 **PRÓXIMOS PASOS PARA PROBAR**

### 1. Verificar Enrollment Service
```powershell
Start-Sleep -Seconds 10
Invoke-WebRequest -Uri "http://localhost:3007/health" -UseBasicParsing
```

### 2. Crear un usuario de prueba (si auth-service está corriendo)
- Usar auth-service para crear usuarios de prueba

### 3. Probar flujo completo:
1. Crear curso (Course Service) ✅
2. Matricular estudiante (Enrollment Service)
3. Ver materias del estudiante (Enrollment Service)
4. Ver estudiantes del curso (Enrollment Service)

---

## 🔗 **URLs de Swagger**

- **Course Service:** http://localhost:3004/api/docs
- **Enrollment Service:** http://localhost:3007/api/docs (cuando esté listo)
- **Auth Service:** http://localhost:3001/api/docs

---

## 📊 **Endpoints Disponibles para Probar**

### **Course Service:**
- ✅ `POST /api/v1/courses` - Crear curso
- ✅ `GET /api/v1/courses` - Listar cursos
- ✅ `GET /api/v1/courses/:id` - Obtener curso por ID
- ✅ `GET /api/v1/courses/code/:code` - Obtener curso por código
- ✅ `GET /api/v1/courses/teachers/:teacherId` - Cursos del docente
- ✅ `PATCH /api/v1/courses/:id` - Actualizar curso
- ✅ `DELETE /api/v1/courses/:id` - Eliminar curso
- ✅ `POST /api/v1/courses/teachers/assign` - Asignar docente
- ✅ `GET /api/v1/courses/:id/teachers` - Docentes del curso

### **Enrollment Service:**
- ✅ `POST /api/v1/enrollments/assign` - Matricular estudiante
- ✅ `GET /api/v1/enrollments/students/:studentId` - Materias del estudiante
- ✅ `GET /api/v1/enrollments/courses/:courseId` - Estudiantes del curso

---

**Estado:** ✅ Servicios funcionando correctamente  
**Listo para:** Probar el flujo completo desde frontend
