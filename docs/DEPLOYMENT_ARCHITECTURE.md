# Arquitectura de Deployment - AWS QA

## Resumen de Cambios

### ✅ API Gateway Eliminado
- **Antes**: LB → Nginx → API Gateway microservicio → Servicios
- **Ahora**: LB → Nginx → Servicios (routing directo)
- **Ventajas**:
  - Menos complejidad
  - Menos recursos (una instancia menos)
  - Menos latencia (un salto menos)
  - LB actúa como punto de entrada (cumple con rubrica)

### ✅ Bases de Datos en Instancias Separadas

#### Postgres (RDS)
- **Auth Service**: `qa-auth-db` (RDS db.t3.micro)
- **Enrollment Service**: `qa-enrollment-db` (RDS db.t3.micro)
- **Course Service**: `qa-course-db` (RDS db.t3.micro)
- **Schedule Service**: `qa-schedule-db` (RDS db.t3.micro)
- **Tutoring Service**: `qa-tutoring-db` (RDS db.t3.micro)

#### MongoDB (EC2)
- **Search Service**: `qa-mongodb` (EC2 t3.micro)
- Connection string: `mongodb://<private-ip>:27017/search`

#### Redis (EC2)
- **Auth Service**: `qa-redis` (EC2 t3.micro)
- Connection string: `redis://<private-ip>:6379`

## Flujo de Deployment

### 1. CI/CD Pipeline
```
GitHub Actions:
1. Tests unitarios
2. Tests de integración
3. Build Docker images (11 microservicios + frontend)
4. Push a DockerHub
5. Terraform Apply
```

### 2. Terraform Deployment
```
Orden de creación:
1. VPC + Subnets (2 AZs)
2. Bastion Host
3. ELB (Application Load Balancer)
4. ASG (Auto Scaling Group) - 2 instancias mínimas
5. RDS (5 instancias Postgres)
6. MongoDB (1 instancia EC2)
7. Redis (1 instancia EC2)
```

### 3. Instancias EC2 (ASG)
```
Cada instancia ejecuta:
1. Docker + Docker Compose
2. Nginx (reverse proxy)
3. 10 microservicios Docker:
   - auth-service (puerto 3001)
   - course-service (puerto 3004)
   - notification-service (puerto 3005)
   - automation-service (puerto 3006)
   - enrollment-service (puerto 3007)
   - schedule-service (puerto 3008)
   - user-service (puerto 3009)
   - tutoring-service (puerto 3010)
   - search-service (puerto 3011)
   - material-service (puerto 3012)
4. Frontend (web-dashboard, puerto 3002)
```

### 4. Routing (Nginx)
```
LB DNS → Nginx (puerto 80) → Servicios:
- /api/v1/auth/* → auth-service:3001
- /api/v1/courses/* → course-service:3004
- /api/v1/enrollments/* → enrollment-service:3007
- /api/v1/schedules/* → schedule-service:3008
- /api/v1/users/* → user-service:3009
- /api/v1/tutoring/* → tutoring-service:3010
- /api/v1/search/* → search-service:3011
- /api/v1/materials/* → material-service:3012
- /api/v1/notifications/* → notification-service:3005
- /api/v1/automation/* → automation-service:3006
- / → web-dashboard:3002 (frontend)
```

## Conexiones de Bases de Datos

### Variables de Entorno en Docker Compose
```yaml
auth-service:
  - DATABASE_URL=postgresql://edu:password@qa-auth-db.xxx.rds.amazonaws.com:5432/authdb
  - REDIS_URL=redis://qa-redis-private-ip:6379

enrollment-service:
  - DATABASE_URL=postgresql://edu:password@qa-enrollment-db.xxx.rds.amazonaws.com:5432/enrollmentdb

course-service:
  - DATABASE_URL=postgresql://edu:password@qa-course-db.xxx.rds.amazonaws.com:5432/coursedb

schedule-service:
  - DATABASE_URL=postgresql://edu:password@qa-schedule-db.xxx.rds.amazonaws.com:5432/scheduledb

tutoring-service:
  - DATABASE_URL=postgresql://edu:password@qa-tutoring-db.xxx.rds.amazonaws.com:5432/tutoringdb

search-service:
  - MONGO_URL=mongodb://qa-mongodb-private-ip:27017/search
```

## Recursos AWS Creados

### Instancias EC2
- **ASG**: 2-8 instancias t3.micro (mínimo 2 para HA)
- **Bastion**: 1 instancia t3.micro
- **MongoDB**: 1 instancia t3.micro
- **Redis**: 1 instancia t3.micro
- **Total**: 5-11 instancias (dentro del límite de 10 para AWS Academy)

### RDS
- **5 instancias** db.t3.micro (una por servicio Postgres)

### Load Balancer
- **1 ALB** (Application Load Balancer)

### VPC
- **1 VPC** con 2 subnets públicas y 2 privadas (2 AZs)
- **1 NAT Gateway** (para acceso a internet desde subnets privadas)
- **1 Internet Gateway**

### Security Groups
- **ELB SG**: Permite tráfico HTTP (80) desde internet
- **ASG SG**: Permite tráfico desde ELB SG
- **RDS SG**: Permite Postgres (5432) desde ASG SG
- **MongoDB SG**: Permite MongoDB (27017) desde ASG SG
- **Redis SG**: Permite Redis (6379) desde ASG SG
- **Bastion SG**: Permite SSH (22) desde internet

## Costos Estimados (AWS Academy)

### Instancias EC2 (t3.micro)
- ASG: 2 instancias × $7.50/mes = $15/mes
- Bastion: 1 instancia × $7.50/mes = $7.50/mes
- MongoDB: 1 instancia × $7.50/mes = $7.50/mes
- Redis: 1 instancia × $7.50/mes = $7.50/mes
- **Total EC2**: ~$37.50/mes

### RDS (db.t3.micro)
- 5 instancias × $15/mes = $75/mes
- **Total RDS**: $75/mes

### Otros
- ALB: ~$16/mes
- NAT Gateway: ~$32/mes
- Data Transfer: ~$5/mes
- **Total Otros**: ~$53/mes

### **Total Estimado**: ~$165/mes

**⚠️ NOTA**: Esto excede el límite de $50/mes de AWS Academy. Considera:
- Reducir a 1 instancia ASG (pero pierdes HA)
- Usar bases de datos compartidas (menos seguro)
- Optimizar NAT Gateway (usar solo 1 AZ)

## Próximos Pasos

1. **Agregar `DOCKERHUB_TOKEN` a GitHub Secrets** (si no está)
2. **Probar deployment** con `terraform apply`
3. **Verificar** que los servicios se conecten a las bases de datos
4. **Optimizar costos** si es necesario
