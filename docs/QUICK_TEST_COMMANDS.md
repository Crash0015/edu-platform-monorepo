# Comandos Rápidos para Probar Servicios

**NOTA:** Primero necesitas añadir el servicio `postgres-course` al docker-compose.local.yml (entre línea 37 y 38).

---

## ⚠️ **PASO 0: Añadir postgres-course al docker-compose**

Abre `infra/docker/docker-compose.local.yml` y añade esto después de la línea 37 (después de `- edu-net` de postgres-enrollment):

```yaml
  # =========================
  # PostgreSQL (Course)
  # =========================
  postgres-course:
    image: postgres:16
    container_name: edu-postgres-course
    environment:
      POSTGRES_USER: edu
      POSTGRES_PASSWORD: edu
      POSTGRES_DB: coursedb
    ports:
      - "5435:5432"
    volumes:
      - pg_course_data:/var/lib/postgresql/data
    networks:
      - edu-net
```

---

## 🚀 **PASO 1: Levantar Infraestructura**

```powershell
cd C:\Users\kriss\Documents\edu-platform-monorepo\edu-platform-monorepo
docker compose -f infra/docker/docker-compose.local.yml up -d postgres postgres-enrollment postgres-course redis zookeeper kafka
```

Espera 15 segundos...

---

## 📦 **PASO 2: Instalar y Generar Prisma**

### Course Service
```powershell
cd apps\course-service
npm install
npm run prisma:generate
```

### Enrollment Service
```powershell
cd ..\enrollment-service
npm install
npm run prisma:generate
```

---

## 🗄️ **PASO 3: Crear Migraciones**

### Course Service
```powershell
cd ..\course-service
$env:DATABASE_URL="postgresql://edu:edu@localhost:5435/coursedb"
npx prisma migrate dev --name init
```

### Enrollment Service
```powershell
cd ..\enrollment-service
$env:DATABASE_URL="postgresql://edu:edu@localhost:5434/enrollmentdb"
npx prisma migrate deploy
```

---

## ▶️ **PASO 4: Levantar Servicios**

### Terminal 1: Course Service
```powershell
cd apps\course-service
$env:DATABASE_URL="postgresql://edu:edu@localhost:5435/coursedb"
$env:KAFKA_BROKERS="localhost:29092"
$env:KAFKA_ENABLED="true"
$env:PORT="3004"
npm run start:dev
```

### Terminal 2: Enrollment Service
```powershell
cd apps\enrollment-service
$env:DATABASE_URL="postgresql://edu:edu@localhost:5434/enrollmentdb"
$env:KAFKA_BROKERS="localhost:29092"
$env:KAFKA_ENABLED="true"
$env:COURSE_SERVICE_URL="http://localhost:3004"
$env:USER_SERVICE_URL="http://localhost:3008"
$env:PORT="3007"
npm run start:dev
```

---

## ✅ **PASO 5: Verificar Swagger**

1. Course Service: http://localhost:3004/api/docs
2. Enrollment Service: http://localhost:3007/api/docs

---

## 🧪 **PASO 6: Probar Endpoints**

### Crear Curso
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/v1/courses" -Method POST -Headers @{"Content-Type"="application/json"; "x-user-id"="11111111-1111-1111-1111-111111111111"; "x-user-roles"="TEACHER"; "x-correlation-id"="test-123"} -Body '{"code":"MAT-101","name":"Matemáticas Básicas","description":"Curso introductorio","capacity":30}'
```

### Listar Cursos
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/v1/courses" -Method GET
```

### Ver Materias del Estudiante
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/api/v1/enrollments/students/11111111-1111-1111-1111-111111111111" -Method GET -Headers @{"x-user-id"="11111111-1111-1111-1111-111111111111"; "x-user-roles"="STUDENT"}
```

---

## 📝 **NOTA IMPORTANTE**

**Antes de ejecutar estos comandos, debes añadir manualmente el servicio `postgres-course` al archivo `infra/docker/docker-compose.local.yml`** como se indica en el PASO 0.
