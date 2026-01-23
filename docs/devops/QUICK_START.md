# 🚀 Inicio Rápido - Despliegue Manual

## ⚡ **Método Más Rápido (Recomendado)**

### **Paso 1: Configurar Credenciales de QA**

```powershell
# Desde la raíz del proyecto:
.\scripts\setup-qa-credentials.ps1
```

Este script te pedirá:
1. Que inicies un Lab en AWS Academy
2. Que copies las 3 credenciales
3. Que las ingreses (no se mostrarán en pantalla)

### **Paso 2: Desplegar QA**

```powershell
.\scripts\deploy-qa.ps1
```

---

## 📝 **Método Manual (Si Prefieres)**

### **1. Iniciar Lab 1 en AWS Academy**

1. Ve a **AWS Academy** → Tu curso
2. Click en **"Start Lab"** o **"Launch Lab"**
3. Espera 1-2 minutos
4. Click en **"AWS Details"** o **"Show"**
5. **Copia estos 3 valores:**
   - `AWS_ACCESS_KEY_ID` (empieza con `ASIA...`)
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (muy largo)

### **2. Editar terraform.tfvars**

```powershell
# Abre el archivo en Notepad:
notepad infra\terraform\qa\terraform.tfvars
```

**Reemplaza estas 3 líneas:**
```hcl
aws_access_key     = "REPLACE_ME"     ← Pega tu AWS_ACCESS_KEY_ID aquí
aws_secret_key     = "REPLACE_ME"     ← Pega tu AWS_SECRET_ACCESS_KEY aquí
aws_session_token  = "REPLACE_ME"     ← Pega tu AWS_SESSION_TOKEN aquí
```

**Guarda el archivo (Ctrl+S)**

### **3. Desplegar**

```powershell
# Opción A: Usar el script
.\scripts\deploy-qa.ps1

# Opción B: Manual
cd infra\terraform\qa
terraform init
terraform plan
terraform apply  # Escribe: yes
```

---

## 🔍 **Verificar que Funcionó**

```powershell
cd infra\terraform\qa
terraform output
```

Deberías ver:
- `bastion_public_ip = "X.X.X.X"`
- `elb_dns_name = "qa-elb-XXXXX.us-east-1.elb.amazonaws.com"`
- `vpc_id = "vpc-xxxxx"`

---

## 🎯 **Para PROD (Lab 2)**

Repite los mismos pasos pero:

1. **Inicia un NUEVO Lab** (Lab 2)
2. **Copia las credenciales del Lab 2** (serán diferentes)
3. Edita `infra\terraform\prod\terraform.tfvars`
4. Ejecuta `.\scripts\deploy-prod.ps1`

---

## ❌ **Si Sigue Fallando**

### **Error: "Invalid credentials"**
- Verifica que copiaste las 3 credenciales completas
- Verifica que no hay espacios extra al inicio/final
- Verifica que el lab sigue activo (no expirado)

### **Error: "terraform command not found"**
```powershell
# Refrescar PATH:
$env:Path=[System.Environment]::GetEnvironmentVariable('Path','Machine')+';'+[System.Environment]::GetEnvironmentVariable('Path','User')
terraform version
```

### **Error: "Resource already exists"**
```powershell
cd infra\terraform\qa
terraform destroy  # Destruye recursos existentes primero
```

---

## 💡 **Tip**

Si prefieres editar manualmente, puedes usar cualquier editor:
- `notepad infra\terraform\qa\terraform.tfvars`
- `code infra\terraform\qa\terraform.tfvars` (VS Code)
- `nano infra\terraform\qa\terraform.tfvars` (si tienes Git Bash)
