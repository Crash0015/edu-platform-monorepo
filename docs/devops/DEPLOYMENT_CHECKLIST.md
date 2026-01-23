# ✅ Checklist de Despliegue - Terraform + AWS Academy

## 🎯 **Antes de Desplegar**

### **1. Verificar Labs Disponibles**
- [ ] Revisar cuántos labs tienes disponibles en AWS Academy
- [ ] Decidir estrategia: 1 lab (QA→PROD secuencial) o 2 labs (simultáneos)

### **2. Configurar GitHub Secrets**
- [ ] `AWS_ACCESS_KEY_ID` - De tu lab de AWS Academy
- [ ] `AWS_SECRET_ACCESS_KEY` - De tu lab de AWS Academy  
- [ ] `AWS_SESSION_TOKEN` - De tu lab de AWS Academy
- [ ] `DOCKERHUB_USERNAME` - Ya debería estar configurado
- [ ] `DOCKERHUB_TOKEN` - Ya debería estar configurado

### **3. Verificar Configuración Local**
- [ ] Terraform instalado (`terraform version`)
- [ ] Archivos `terraform.tfvars` NO están commiteados (están en `.gitignore`)

---

## 🚀 **Despliegue Manual (Recomendado para Primera Vez)**

### **QA Environment**

1. **Iniciar Lab en AWS Academy:**
   ```bash
   # Ve a AWS Academy → Start Lab
   # Copia las 3 credenciales
   ```

2. **Configurar terraform.tfvars:**
   ```bash
   cd infra/terraform/qa
   cp terraform.tfvars.example terraform.tfvars
   # Edita terraform.tfvars con tus credenciales
   ```

3. **Desplegar:**
   ```bash
   terraform init
   terraform plan  # Revisa qué se va a crear
   terraform apply # Confirma con 'yes'
   ```

4. **Verificar:**
   ```bash
   terraform output
   # Deberías ver: bastion_public_ip, elb_dns_name, etc.
   ```

5. **Tomar Screenshots:**
   - VPC en AWS Console
   - EC2 Bastion
   - ALB
   - Security Groups

### **PROD Environment**

Repite los pasos anteriores pero en `infra/terraform/prod/`

---

## 🤖 **Despliegue Automático (CI/CD)**

### **Opción 1: Trigger Manual**
1. Ve a GitHub → Actions → "Terraform Infrastructure"
2. Click "Run workflow"
3. Selecciona:
   - Environment: `qa` o `prod`
   - Action: `apply`
4. Click "Run workflow"

### **Opción 2: Push con Tag**
```bash
git commit -m "[terraform] Deploy infrastructure"
git push origin main
```
Esto ejecutará `terraform apply` automáticamente.

---

## ⚠️ **Problemas Comunes**

### **Error: "Invalid credentials"**
- **Causa:** Credenciales expiradas (labs duran ~4 horas)
- **Solución:** Inicia un nuevo lab y actualiza secrets en GitHub

### **Error: "Terraform plan failed"**
- **Causa:** Variables faltantes o incorrectas
- **Solución:** Verifica `terraform.tfvars` o secrets en GitHub

### **Error: "Resource limit exceeded"**
- **Causa:** AWS Academy tiene límites de recursos
- **Solución:** Destruye recursos no usados: `terraform destroy`

### **Error: "Docker image not found"**
- **Causa:** Imagen no existe en DockerHub
- **Solución:** Verifica que `docker-publish` workflow haya corrido exitosamente

---

## 🧹 **Cleanup (Importante para Ahorrar Costos)**

### **Destruir QA:**
```bash
cd infra/terraform/qa
terraform destroy
```

### **Destruir PROD:**
```bash
cd infra/terraform/prod
terraform destroy
```

**⚠️ IMPORTANTE:** Destruye los recursos cuando termines de tomar screenshots para evitar costos innecesarios.

---

## 📊 **Verificar que Funciona**

### **1. Verificar Infraestructura:**
```bash
# En AWS Console:
- VPC creada con subnets
- EC2 Bastion corriendo
- ALB creado
- ECS Cluster creado (si desplegaste servicios)
```

### **2. Verificar Conectividad:**
```bash
# Probar ALB:
curl http://<elb_dns_name>/health

# Probar Bastion (si configuraste key):
ssh -i your-key.pem ec2-user@<bastion_public_ip>
```

### **3. Verificar Logs:**
```bash
# CloudWatch Logs (si desplegaste ECS):
- /ecs/qa/api-gateway
- /ecs/qa/auth-service
```

---

## 📸 **Evidencias para Rúbrica**

Asegúrate de tener screenshots de:

- [ ] VPC con subnets públicas/privadas (multi-AZ)
- [ ] EC2 Bastion (Jump Box)
- [ ] ALB (Elastic Load Balancer)
- [ ] ASG con mínimo 2 instancias (PROD)
- [ ] API Gateway endpoint
- [ ] Security Groups configurados
- [ ] NAT Gateway(s)
- [ ] ECS Cluster y Services (si desplegaste contenedores)

---

## 🔄 **Renovación de Labs**

Si tu lab expira:

1. **Antes de que expire:**
   - Toma todas las screenshots necesarias
   - Ejecuta `terraform destroy` para limpiar recursos

2. **Después de que expire:**
   - Inicia un nuevo lab
   - Obtén nuevas credenciales
   - Actualiza secrets en GitHub
   - Despliega de nuevo si es necesario

---

**💡 Tip Final:** Usa `terraform plan` siempre antes de `apply` para ver qué se va a crear/modificar. Esto te ayuda a evitar sorpresas y costos inesperados.
