# Guía de Pruebas - Course Service y Enrollment Service

**Fecha:** 2026-01-12  
**Objetivo:** Probar los servicios implementados

---

## 🚀 **PASO 1: Levantar Infraestructura**

### Opción A: Solo servicios necesarios (rápido)
```bash
cd infra/docker
docker compose -f docker-compose.local.yml up -d postgres postgres-enrollment postgres-course redis zookeeper kafka
```

### Opción B: Todo el stack
```bash
cd infra/docker
docker compose -f docker-compose.local.yml up -d
```

**Espera 10-15 segundos** para que las bases de datos estén listas.

---

## 📦 **PASO 2: Instalar Dependencias y Generar Prisma**

### Course Service
```bash
cd apps/course-service
npm install
npm run prisma:generate
```

### Enrollment Service (ya debería estar listo)
```bash
cd apps/enrollment-service
npm install
npm run prisma:generate
```

---

## 🗄️ **PASO 3: Crear Migraciones de Base de Datos**

### Course Service
```bash
cd apps/course-service

# Crear migración inicial
DATABASE_URL="postgresql://edu:edu@localhost:5435/coursedb" npx prisma migrate dev --name init

# O aplicar migraciones directamente (si ya existen)
DATABASE_URL="postgresql://edu:edu@localhost:5435/coursedb" npx prisma migrate deploy
```

### Enrollment Service
```bash
cd apps/enrollment-service

# Aplicar migraciones
DATABASE_URL="postgresql://edu:edu@localhost:5434/enrollmentdb" npx prisma migrate deploy
```

---

## ▶️ **PASO 4: Levantar los Servicios**

### Terminal 1: Course Service
```bash
cd apps/course-service
DATABASE_URL="postgresql://edu:edu@localhost:5435/coursedb" \
KAFKA_BROKERS="localhost:29092" \
KAFKA_ENABLED="true" \
npm run start:dev
```

### Terminal 2: Enrollment Service
```bash
cd apps/enrollment-service
DATABASE_URL="postgresql://edu:edu@localhost:5434/enrollmentdb" \
KAFKA_BROKERS="localhost:29092" \
KAFKA_ENABLED="true" \
COURSE_SERVICE_URL="http://localhost:3004" \
USER_SERVICE_URL="http://localhost:3008" \
npm run start:dev
```

**Verifica que ambos servicios estén corriendo:**
- Course Service: http://localhost:3004/api/docs
- Enrollment Service: http://localhost:3007/api/docs

---

## ✅ **PASO 5: Probar Endpoints**

### 5.1 Course Service - Crear un Curso

**POST** `http://localhost:3004/api/v1/courses`

Headers:
```
Content-Type: application/json
x-user-id: <teacher-user-id>
x-user-roles: TEACHER
x-correlation-id: test-123
```

Body:
```json
{
  "code": "MAT-101",
  "name": "Matemáticas Básicas",
  "description": "Curso introductorio de matemáticas",
  "capacity": 30
}
```

**Respuesta esperada:** 201 Created con el curso creado

---

### 5.2 Course Service - Listar Cursos

**GET** `http://localhost:3004/api/v1/courses`

**Respuesta esperada:** Array de cursos

---

### 5.3 Course Service - Obtener Curso por ID

**GET** `http://localhost:3004/api/v1/courses/{courseId}`

(Usa el ID del curso creado anteriormente)

---

### 5.4 Enrollment Service - Matricular Estudiante

**POST** `http://localhost:3007/api/v1/enrollments/assign`

Headers:
```
Content-Type: application/json
x-user-id: <teacher-user-id>
x-user-roles: TEACHER
x-correlation-id: test-456
```

Body:
```json
{
  "studentId": "<student-user-id>",
  "courseId": "<course-id-from-step-5-1>",
  "correlationId": "test-456"
}
```

**Respuesta esperada:** 201 Created con el enrollment

---

### 5.5 Enrollment Service - Ver Materias del Estudiante

**GET** `http://localhost:3007/api/v1/enrollments/students/{studentId}`

Headers:
```
x-user-id: <student-user-id>
x-user-roles: STUDENT
```

**Respuesta esperada:** Array de enrollments con detalles completos de cursos

---

### 5.6 Enrollment Service - Ver Estudiantes de un Curso

**GET** `http://localhost:3007/api/v1/enrollments/courses/{courseId}`

Headers:
```
x-user-id: <teacher-user-id>
x-user-roles: TEACHER
```

**Respuesta esperada:** Array de enrollments con detalles de estudiantes

---

## 🧪 **Pruebas Rápidas con curl**

### Crear Curso
```bash
curl -X POST http://localhost:3004/api/v1/courses \
  -H "Content-Type: application/json" \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111" \
  -H "x-user-roles: TEACHER" \
  -H "x-correlation-id: test-123" \
  -d '{
    "code": "MAT-101",
    "name": "Matemáticas Básicas",
    "description": "Curso introductorio",
    "capacity": 30
  }'
```

### Listar Cursos
```bash
curl http://localhost:3004/api/v1/courses
```

### Ver Materias del Estudiante
```bash
curl http://localhost:3007/api/v1/enrollments/students/11111111-1111-1111-1111-111111111111 \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111" \
  -H "x-user-roles: STUDENT"
```

---

## 📊 **Verificar Swagger**

1. **Course Service Swagger:**
   - URL: http://localhost:3004/api/docs
   - Deberías ver todos los endpoints de cursos

2. **Enrollment Service Swagger:**
   - URL: http://localhost:3007/api/docs
   - Deberías ver el endpoint de matrícula + los nuevos endpoints de consulta

---

## ⚠️ **Troubleshooting**

### Error: Cannot connect to database
- Verifica que postgres-course esté corriendo: `docker ps | grep postgres-course`
- Verifica el puerto: debe ser 5435

### Error: Kafka connection failed
- Verifica que kafka esté corriendo: `docker ps | grep kafka`
- Usa `localhost:29092` para conexiones desde el host

### Error: Prisma client not generated
- Ejecuta: `npm run prisma:generate` en cada servicio

### Error: Migrations failed
- Verifica la conexión a la base de datos
- Asegúrate de usar el DATABASE_URL correcto

---

## ✅ **Checklist de Pruebas**

- [ ] Postgres-course levantado
- [ ] Kafka y Zookeeper levantados
- [ ] Course Service corriendo en puerto 3004
- [ ] Enrollment Service corriendo en puerto 3007
- [ ] Swagger accesible para ambos servicios
- [ ] Poder crear un curso
- [ ] Poder listar cursos
- [ ] Poder matricular un estudiante
- [ ] Poder ver materias del estudiante (con detalles)
- [ ] Poder ver estudiantes de un curso (con detalles)

---

**¡Listo para probar!** 🚀
