# 🚀 Guía de Despliegue Manual - Paso a Paso

## 📋 **Resumen**

Tienes **30 labs disponibles**, así que puedes usar **2 labs simultáneos**:
- **Lab 1 (QA):** Para desplegar `infra/terraform/qa/`
- **Lab 2 (PROD):** Para desplegar `infra/terraform/prod/`

---

## 🎯 **Opción 1: 2 Labs Diferentes (Recomendado)**

### **Paso 1: Iniciar Lab 1 (QA)**

1. Ve a **AWS Academy** → Tu curso
2. Click en **"Start Lab"** o **"Launch Lab"** (Lab 1)
3. Espera 1-2 minutos a que se inicie
4. Click en **"AWS Details"** o **"Show"** para ver credenciales
5. **Copia estos 3 valores:**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN`

### **Paso 2: Configurar QA Localmente**

```powershell
# 1. Ve al directorio de QA
cd C:\Users\kriss\Documents\edu-platform-monorepo\edu-platform-monorepo\infra\terraform\qa

# 2. Copia el archivo de ejemplo
Copy-Item terraform.tfvars.example terraform.tfvars

# 3. Abre terraform.tfvars en tu editor y reemplaza:
#    aws_access_key = "TU_ACCESS_KEY_DEL_LAB_1"
#    aws_secret_key = "TU_SECRET_KEY_DEL_LAB_1"
#    aws_session_token = "TU_SESSION_TOKEN_DEL_LAB_1"
```

**Edita `terraform.tfvars` con tus credenciales del Lab 1:**

```hcl
aws_access_key     = "ASIAXXXXXXXXXXXXXXXX"
aws_secret_key     = "tu-secret-key-aqui"
aws_session_token  = "tu-session-token-aqui"

aws_region   = "us-east-1"
environment  = "qa"
vpc_cidr     = "10.10.0.0/16"

enable_nat_gateway = true
nat_gateway_per_az = false  # Ahorra costos en QA
```

### **Paso 3: Desplegar QA**

```powershell
# Asegúrate de estar en el directorio correcto
cd C:\Users\kriss\Documents\edu-platform-monorepo\edu-platform-monorepo\infra\terraform\qa

# 1. Inicializar Terraform
terraform init

# 2. Ver qué se va a crear (MUY IMPORTANTE)
terraform plan

# 3. Si todo se ve bien, aplicar
terraform apply

# 4. Cuando te pregunte, escribe: yes
```

**✅ Deberías ver:**
```
Apply complete! Resources: X added, 0 changed, 0 destroyed.

Outputs:

bastion_public_ip = "X.X.X.X"
elb_dns_name = "qa-elb-XXXXX.us-east-1.elb.amazonaws.com"
vpc_id = "vpc-xxxxx"
```

### **Paso 4: Verificar QA en AWS Console**

1. Ve a **AWS Console** (usa las credenciales del Lab 1)
2. Verifica:
   - **VPC:** Deberías ver `qa-vpc`
   - **EC2:** Deberías ver `qa-bastion`
   - **EC2 Load Balancers:** Deberías ver `qa-elb`
   - **Auto Scaling Groups:** Deberías ver `qa-asg`

---

## 🎯 **Paso 5: Iniciar Lab 2 (PROD)**

1. Ve a **AWS Academy** → Tu curso
2. Click en **"Start Lab"** o **"Launch Lab"** (Lab 2 - **NUEVO LAB**)
3. Espera 1-2 minutos
4. Click en **"AWS Details"** para ver credenciales
5. **Copia estos 3 valores (SON DIFERENTES AL LAB 1):**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN`

### **Paso 6: Configurar PROD Localmente**

```powershell
# 1. Ve al directorio de PROD
cd C:\Users\kriss\Documents\edu-platform-monorepo\edu-platform-monorepo\infra\terraform\prod

# 2. Copia el archivo de ejemplo
Copy-Item terraform.tfvars.example terraform.tfvars

# 3. Edita terraform.tfvars con credenciales del LAB 2
```

**Edita `terraform.tfvars` con tus credenciales del Lab 2:**

```hcl
aws_access_key     = "ASIAYYYYYYYYYYYY"  # DIFERENTE AL LAB 1
aws_secret_key     = "tu-secret-key-lab-2"
aws_session_token  = "tu-session-token-lab-2"

aws_region   = "us-east-1"
environment  = "prod"
vpc_cidr     = "10.20.0.0/16"  # DIFERENTE CIDR PARA PROD

# High availability para PROD:
enable_nat_gateway     = true
nat_gateway_per_az     = true  # 1 NAT por AZ (más HA)
asg_min_size           = 2
asg_desired_capacity   = 2
```

### **Paso 7: Desplegar PROD**

```powershell
# Asegúrate de estar en el directorio correcto
cd C:\Users\kriss\Documents\edu-platform-monorepo\edu-platform-monorepo\infra\terraform\prod

# 1. Inicializar Terraform
terraform init

# 2. Ver qué se va a crear
terraform plan

# 3. Si todo se ve bien, aplicar
terraform apply

# 4. Cuando te pregunte, escribe: yes
```

**✅ Deberías ver:**
```
Apply complete! Resources: X added, 0 changed, 0 destroyed.

Outputs:

bastion_public_ip = "Y.Y.Y.Y"
elb_dns_name = "prod-elb-YYYYY.us-east-1.elb.amazonaws.com"
vpc_id = "vpc-yyyyy"
```

---

## 🔍 **Verificar que Todo Funciona**

### **QA (Lab 1):**

```powershell
# Ver outputs de QA
cd C:\Users\kriss\Documents\edu-platform-monorepo\edu-platform-monorepo\infra\terraform\qa
terraform output
```

**Deberías ver:**
- `bastion_public_ip` - IP pública del bastion
- `elb_dns_name` - DNS del load balancer
- `vpc_id` - ID de la VPC

### **PROD (Lab 2):**

```powershell
# Ver outputs de PROD
cd C:\Users\kriss\Documents\edu-platform-monorepo\edu-platform-monorepo\infra\terraform\prod
terraform output
```

---

## 📸 **Tomar Screenshots para Rúbrica**

### **Para QA (Lab 1):**
1. **AWS Console** con credenciales del Lab 1:
   - VPC → `qa-vpc` con subnets
   - EC2 → `qa-bastion` instance
   - EC2 Load Balancers → `qa-elb`
   - Auto Scaling → `qa-asg`

### **Para PROD (Lab 2):**
1. **AWS Console** con credenciales del Lab 2:
   - VPC → `prod-vpc` con subnets (multi-AZ)
   - EC2 → `prod-bastion` instance
   - EC2 Load Balancers → `prod-elb`
   - Auto Scaling → `prod-asg` (mínimo 2 instancias)
   - NAT Gateways → 2 NATs (uno por AZ)

---

## 🧹 **Destruir Recursos (Cuando Termines)**

### **Destruir QA:**

```powershell
cd C:\Users\kriss\Documents\edu-platform-monorepo\edu-platform-monorepo\infra\terraform\qa
terraform destroy
# Escribe: yes
```

### **Destruir PROD:**

```powershell
cd C:\Users\kriss\Documents\edu-platform-monorepo\edu-platform-monorepo\infra\terraform\prod
terraform destroy
# Escribe: yes
```

**⚠️ IMPORTANTE:** Destruye los recursos antes de que expiren los labs para evitar costos.

---

## 🔄 **Opción 2: Mismo Lab para QA y PROD (Secuencial)**

Si prefieres usar **1 solo lab** (aunque tienes 30 disponibles):

1. **Desplegar QA:**
   ```powershell
   cd infra\terraform\qa
   terraform init
   terraform apply
   ```

2. **Tomar screenshots de QA**

3. **Destruir QA:**
   ```powershell
   terraform destroy
   ```

4. **Desplegar PROD (mismo lab, mismas credenciales):**
   ```powershell
   cd ..\prod
   terraform init
   terraform apply
   ```

5. **Tomar screenshots de PROD**

6. **Destruir PROD:**
   ```powershell
   terraform destroy
   ```

---

## ❓ **Troubleshooting**

### **Error: "Invalid credentials"**
- **Causa:** Credenciales incorrectas o expiradas
- **Solución:** Verifica que copiaste las credenciales correctas del lab correcto

### **Error: "Resource already exists"**
- **Causa:** Ya desplegaste algo antes
- **Solución:** Ejecuta `terraform destroy` primero, o importa el recurso existente

### **Error: "Insufficient permissions"**
- **Causa:** El lab no tiene permisos suficientes
- **Solución:** Algunos labs tienen restricciones. Verifica en AWS Academy

### **Error: "VPC CIDR overlaps"**
- **Causa:** QA y PROD usan el mismo CIDR
- **Solución:** QA usa `10.10.0.0/16`, PROD usa `10.20.0.0/16` (ya configurado)

---

## ✅ **Checklist Final**

- [ ] Lab 1 iniciado y credenciales copiadas
- [ ] `terraform.tfvars` creado en `infra/terraform/qa/`
- [ ] QA desplegado exitosamente
- [ ] Screenshots de QA tomados
- [ ] Lab 2 iniciado y credenciales copiadas
- [ ] `terraform.tfvars` creado en `infra/terraform/prod/`
- [ ] PROD desplegado exitosamente
- [ ] Screenshots de PROD tomados
- [ ] Recursos destruidos cuando termines

---

**💡 Tip:** Con 30 labs disponibles, puedes dejar QA y PROD corriendo simultáneamente sin problemas. Solo recuerda destruirlos cuando termines para evitar costos innecesarios.
