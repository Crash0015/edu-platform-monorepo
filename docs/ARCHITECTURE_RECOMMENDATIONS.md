# Recomendaciones de Arquitectura para Deployment

## Problemas Identificados

### 1. ✅ Docker Login (CORREGIDO)
- **Problema**: Las imágenes no se descargaban porque faltaba `docker login`
- **Solución**: Agregado `docker login` en user_data con `DOCKERHUB_TOKEN`

### 2. 🔄 API Gateway Duplicado (PENDIENTE DECISIÓN)

#### Situación Actual:
- **Nginx** (en cada instancia EC2) hace routing:
  - `/api/v1/*` → `api-gateway` microservicio
  - `/` → `web-dashboard` (frontend)
- **API Gateway microservicio** también hace routing:
  - `/api/v1/gateway/auth/*` → `auth-service`
  - `/api/v1/gateway/enrollments/*` → `enrollment-service`
  - etc.

#### Opciones:

##### Opción A: Eliminar API Gateway Microservicio (RECOMENDADO)
**Ventajas:**
- ✅ Menos complejidad
- ✅ Menos recursos (una instancia menos)
- ✅ Routing directo desde Nginx a servicios
- ✅ Menos latencia (un salto menos)
- ✅ Más simple de mantener

**Desventajas:**
- ❌ Requiere cambios en el código del frontend (rutas cambiarían)
- ❌ Pierdes funcionalidad del API Gateway (rate limiting, validación centralizada, etc.)

**Cambios necesarios:**
1. Eliminar `api-gateway` del docker-compose.yml
2. Actualizar Nginx para routear directamente:
   - `/api/v1/auth/*` → `auth-service:3001`
   - `/api/v1/courses/*` → `course-service:3004`
   - `/api/v1/enrollments/*` → `enrollment-service:3007`
   - etc.
3. Actualizar frontend para usar rutas directas

##### Opción B: Mantener API Gateway, Simplificar Nginx (ACTUAL)
**Ventajas:**
- ✅ No requiere cambios en frontend
- ✅ Mantiene funcionalidad del API Gateway
- ✅ Centraliza lógica de routing

**Desventajas:**
- ❌ Duplicación de routing (Nginx → API Gateway → Servicios)
- ❌ Más latencia (dos saltos)
- ❌ Más recursos

**Mejora sugerida:**
- Nginx solo routea a `api-gateway` y `web-dashboard`
- API Gateway maneja todo el routing interno

#### Recomendación:
**Para cumplir con la rubrica y simplificar: Opción A (Eliminar API Gateway microservicio)**

El Load Balancer ya actúa como punto de entrada, y Nginx puede hacer todo el routing necesario.

### 3. 🗄️ Bases de Datos (PENDIENTE)

#### Situación Actual:
- Bases de datos están en Docker Compose (Postgres, MongoDB, Redis)
- Se ejecutan en las mismas instancias que los servicios

#### Problemas:
- ❌ No hay alta disponibilidad
- ❌ No hay backups automáticos
- ❌ Compiten por recursos con los servicios
- ❌ No escalan independientemente

#### Solución Recomendada: RDS (Relational Database Service)

**Para Postgres (auth, enrollment, course):**
```hcl
# Crear módulo RDS
module "rds" {
  source = "../modules/rds"
  
  vpc_id            = module.vpc.vpc_id
  private_subnets   = module.vpc.private_subnets
  environment       = var.environment
  
  # Instancias separadas por servicio (o multi-DB en una instancia)
  databases = {
    auth      = { name = "authdb", port = 5432 }
    enrollment = { name = "enrollmentdb", port = 5433 }
    course    = { name = "coursedb", port = 5434 }
  }
  
  instance_class = "db.t3.micro"  # Más barato para AWS Academy
  allocated_storage = 20
  backup_retention_period = 7
}
```

**Para MongoDB (search-service):**
- Opción 1: DocumentDB (servicio administrado de AWS, compatible con MongoDB)
- Opción 2: MongoDB en EC2 separada (más barato pero menos administrado)

**Para Redis:**
- Opción 1: ElastiCache (servicio administrado)
- Opción 2: Redis en EC2 separada (más barato)

#### Costos Estimados (AWS Academy):
- RDS db.t3.micro: ~$15-20/mes por instancia
- DocumentDB: ~$30-40/mes
- ElastiCache: ~$15-20/mes

**Total estimado: ~$60-80/mes para todas las bases de datos**

### 4. 🔐 Bastion Host

#### Situación Actual:
- Bastion está creado pero sin key pair configurado
- No se puede acceder por SSH

#### Solución:
1. **Crear Key Pair manualmente en AWS Console:**
   - EC2 → Key Pairs → Create key pair
   - Nombre: `qa-bastion-key`
   - Tipo: RSA
   - Formato: `.pem`

2. **Actualizar Terraform:**
   ```hcl
   module "bastion" {
     # ...
     key_name = "qa-bastion-key"  # Usar el key pair creado
     create_key_pair = false
   }
   ```

3. **Acceder al bastion:**
   ```bash
   ssh -i qa-bastion-key.pem ec2-user@<bastion-public-ip>
   ```

## Plan de Implementación Recomendado

### Fase 1: Correcciones Inmediatas (AHORA)
1. ✅ Docker login agregado
2. ⏳ Agregar `dockerhub_token` a GitHub Secrets
3. ⏳ Actualizar workflow para pasar token a Terraform

### Fase 2: Simplificación (SIGUIENTE)
1. Decidir: ¿Eliminar API Gateway microservicio?
2. Si sí: Actualizar Nginx y frontend
3. Si no: Documentar arquitectura actual

### Fase 3: Bases de Datos (FUTURO)
1. Crear módulo RDS para Postgres
2. Migrar datos de Docker a RDS
3. Actualizar connection strings en servicios
4. (Opcional) Agregar DocumentDB para MongoDB

## Variables Necesarias en GitHub Secrets

Agregar:
- `DOCKERHUB_TOKEN` (ya existe para CI/CD, reutilizar)

## Variables Necesarias en Terraform

Agregar a `infra/terraform/qa/terraform.tfvars`:
```hcl
dockerhub_token = "tu-token-de-dockerhub"
```

O pasar como variable en el workflow:
```yaml
-var="dockerhub_token=${{ secrets.DOCKERHUB_TOKEN }}"
```
