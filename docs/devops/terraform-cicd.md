# Terraform CI/CD Integration

Este documento explica cómo está integrado Terraform con el pipeline de CI/CD de GitHub Actions.

---

## 📋 **Flujo Completo**

```
1. Push a main → CI ejecuta tests
2. Tests pasan → Docker images se construyen y suben a DockerHub
3. Docker images listas → Terraform despliega infraestructura en AWS
4. Infraestructura lista → ECS Fargate despliega contenedores Docker
```

---

## 🔧 **Configuración Requerida**

### **GitHub Secrets**

Necesitas configurar estos secrets en tu repositorio de GitHub:

1. **DockerHub** (ya configurados):
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

2. **AWS Academy** (nuevos):
   - `AWS_ACCESS_KEY_ID` - Access Key de tu lab de AWS Academy
   - `AWS_SECRET_ACCESS_KEY` - Secret Key de tu lab
   - `AWS_SESSION_TOKEN` - Session Token (credenciales temporales)

**Cómo obtener credenciales de AWS Academy:**
1. Abre tu lab en AWS Academy
2. Ve a "AWS Details" o "Credentials"
3. Copia los 3 valores (Access Key, Secret Key, Session Token)
4. Ve a GitHub → Settings → Secrets and variables → Actions
5. Agrega los 3 secrets

**⚠️ IMPORTANTE:** Las credenciales de AWS Academy son **temporales** (expiran en ~4 horas). Necesitarás actualizarlas periódicamente o usar un lab nuevo.

---

## 📁 **Estructura de Workflows**

### **`.github/workflows/ci.yml`**
- Ejecuta tests y build de Docker images
- Push de imágenes a DockerHub cuando hay cambios

### **`.github/workflows/terraform.yml`** (NUEVO)
- **En PRs:** Ejecuta `terraform plan` para QA y PROD
- **En push a main:** Ejecuta `terraform apply` para desplegar infraestructura
- **Manual:** Permite ejecutar plan/apply/destroy manualmente

---

## 🚀 **Cómo Funciona**

### **1. Pull Request (Plan)**
Cuando abres un PR que modifica `infra/terraform/**`:
- Se ejecuta `terraform plan` para QA y PROD
- Los resultados se comentan en el PR
- **No se crea/modifica infraestructura**

### **2. Merge a Main (Apply)**
Cuando haces merge a main:
- Se ejecuta `terraform apply` para QA y PROD
- Se crea/modifica infraestructura en AWS
- Los contenedores Docker se despliegan en ECS Fargate

### **3. Ejecución Manual**
Puedes ejecutar Terraform manualmente desde GitHub Actions:
1. Ve a "Actions" → "Terraform Infrastructure"
2. Click en "Run workflow"
3. Selecciona:
   - Environment: `qa` o `prod`
   - Action: `plan`, `apply`, o `destroy`

---

## 🏗️ **Infraestructura Desplegada**

### **QA Environment** (`infra/terraform/qa/`)
- VPC multi-AZ (2 subnets públicas, 2 privadas)
- NAT Gateway (1 para ahorrar costos)
- EC2 Bastion (Jump box)
- ALB (Application Load Balancer)
- ECS Fargate Cluster
- ECS Services para microservicios
- API Gateway (HTTP API)

### **PROD Environment** (`infra/terraform/prod/`)
- VPC multi-AZ (2 subnets públicas, 2 privadas)
- NAT Gateway (1 por AZ = alta disponibilidad)
- EC2 Bastion (Jump box)
- ALB (Application Load Balancer)
- ECS Fargate Cluster
- ECS Services para microservicios (mínimo 2 tasks)
- API Gateway (HTTP API)

---

## 📦 **Módulos Terraform**

### **`modules/vpc`**
- Crea VPC con subnets públicas/privadas
- Internet Gateway
- NAT Gateway(s)
- Route tables

### **`modules/bastion`**
- EC2 instance para acceso SSH seguro
- Security group con restricción de IPs

### **`modules/elb`**
- Application Load Balancer
- Target group por defecto
- HTTP listener

### **`modules/alb_target_group`**
- Target groups adicionales para cada microservicio
- Listener rules para routing por path

### **`modules/ecs_fargate`**
- ECS Cluster
- Task definitions
- ECS Services
- Security groups
- CloudWatch logs

### **`modules/apigateway_http`**
- API Gateway HTTP API
- Integración con ALB

---

## 🔄 **Actualizar Imágenes Docker**

Cuando haces push de nuevas imágenes Docker:
1. CI construye y sube imágenes a DockerHub
2. Para actualizar ECS, necesitas:
   - Opción A: Ejecutar Terraform manualmente (reapply)
   - Opción B: Modificar `image_tag` en variables y hacer commit

**Recomendación:** Usa tags semánticos (`v1.0.0`) o SHA (`sha-abc123`) en lugar de `latest` para mejor control.

---

## 🐛 **Troubleshooting**

### **Error: "Invalid credentials"**
- Verifica que los secrets de AWS estén actualizados (expiran cada ~4 horas)
- Revisa que los nombres de los secrets sean exactos

### **Error: "Terraform plan failed"**
- Revisa los logs del workflow
- Verifica que las variables estén correctas en `terraform.tfvars.example`

### **Error: "ECS service not starting"**
- Revisa CloudWatch logs del servicio
- Verifica que la imagen Docker exista en DockerHub
- Verifica que el health check esté funcionando

---

## 📝 **Próximos Pasos**

1. **Configurar secrets de AWS** en GitHub
2. **Probar workflow** con un PR pequeño
3. **Desplegar QA** primero (menos costoso)
4. **Verificar que los servicios estén corriendo** en ECS
5. **Desplegar PROD** cuando QA esté estable

---

## 🔗 **Referencias**

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [ECS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
