# AWS Academy Labs - Guía de Uso

## 📚 **¿Qué son los Labs de AWS Academy?**

AWS Academy te da acceso a **laboratorios temporales** con credenciales de AWS reales para practicar. Cada lab es **independiente** y tiene sus propias credenciales temporales.

---

## 🔢 **¿Cuántos Labs Puedes Usar?**

**Respuesta corta:** Depende de tu institución, pero normalmente son **2 labs simultáneos**.

### **Límites Típicos:**
- **Labs simultáneos:** 2 (uno para QA, otro para PROD)
- **Duración:** Cada lab dura ~4 horas (las credenciales expiran)
- **Renovación:** Puedes iniciar nuevos labs cuando los anteriores expiren

### **Estrategia Recomendada:**

#### **Opción 1: 2 Labs Simultáneos (Recomendado)**
```
Lab 1 (QA):   infra/terraform/qa/    → Despliega ambiente QA
Lab 2 (PROD): infra/terraform/prod/  → Despliega ambiente PROD
```
- **Ventaja:** Tienes ambos ambientes corriendo al mismo tiempo
- **Desventaja:** Usas 2 labs de tu cuenta

#### **Opción 2: 1 Lab a la Vez (Ahorro)**
```
Lab 1: Despliega QA → Toma screenshots → Destroy → Despliega PROD
```
- **Ventaja:** Solo usas 1 lab
- **Desventaja:** No puedes tener ambos ambientes corriendo simultáneamente

---

## 🔑 **Cómo Obtener Credenciales de un Lab**

1. **Inicia un lab en AWS Academy:**
   - Ve a tu curso en AWS Academy
   - Click en "Start Lab" o "Launch Lab"
   - Espera a que el lab se inicie (1-2 minutos)

2. **Obtén las credenciales:**
   - Click en "AWS Details" o "Show" en la sección de credenciales
   - Copia estos 3 valores:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_SESSION_TOKEN`

3. **Configúralas en GitHub:**
   - Ve a tu repo → Settings → Secrets and variables → Actions
   - Agrega/actualiza estos secrets:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_SESSION_TOKEN`

---

## ⚠️ **IMPORTANTE: Credenciales Temporales**

### **Expiración:**
- Las credenciales expiran después de **~4 horas**
- Cuando expiran, el workflow de Terraform fallará con "Invalid credentials"

### **Solución:**
1. **Opción A:** Inicia un nuevo lab y actualiza los secrets en GitHub
2. **Opción B:** Usa el workflow manual para desplegar solo cuando necesites

---

## 🎯 **Estrategia para la Rúbrica**

### **Para Evidencias (Screenshots):**

1. **Lab 1 (QA):**
   - Inicia lab → Obtén credenciales → Configura en GitHub
   - Despliega QA: `terraform apply` en `infra/terraform/qa/`
   - Toma screenshots de:
     - VPC con subnets
     - EC2 Bastion
     - ALB
     - ECS Cluster
   - **NO destruyas** hasta tener todas las evidencias

2. **Lab 2 (PROD):**
   - Inicia lab → Obtén credenciales → Configura en GitHub
   - Despliega PROD: `terraform apply` en `infra/terraform/prod/`
   - Toma screenshots de:
     - VPC multi-AZ con NAT por AZ
     - ASG con mínimo 2 instancias
     - API Gateway
   - **NO destruyas** hasta tener todas las evidencias

3. **Después de evidencias:**
   - Ejecuta `terraform destroy` en ambos ambientes
   - Esto libera los labs para que puedas iniciar nuevos

---

## 💰 **Costos (Importante)**

### **Recursos que Generan Costos:**
- **NAT Gateway:** ~$0.045/hora (~$32/mes si está 24/7)
- **ALB:** ~$0.0225/hora (~$16/mes)
- **EC2 Bastion:** ~$0.0104/hora (~$7.50/mes) (t3.micro)
- **ECS Fargate:** ~$0.04/vCPU-hora + ~$0.004/GB-hora
- **Data transfer:** Variable

### **Recomendaciones:**
- **QA:** Usa `nat_gateway_per_az = false` (1 NAT = más barato)
- **PROD:** Usa `nat_gateway_per_az = true` (HA, pero más caro)
- **Destruye** los ambientes cuando no los uses: `terraform destroy`
- **Monitorea** el uso en AWS Cost Explorer

---

## 🔄 **Workflow Recomendado**

### **Día 1: Setup y QA**
1. Inicia Lab 1
2. Configura secrets en GitHub
3. Despliega QA
4. Toma screenshots
5. **NO destruyas aún**

### **Día 2: PROD**
1. Inicia Lab 2 (si tienes 2 labs disponibles)
2. Actualiza secrets en GitHub (nuevas credenciales)
3. Despliega PROD
4. Toma screenshots
5. **NO destruyas aún**

### **Día 3: Evidencias y Cleanup**
1. Verifica que tienes todas las screenshots
2. Ejecuta `terraform destroy` en QA
3. Ejecuta `terraform destroy` en PROD
4. Esto libera los labs

---

## ❓ **Preguntas Frecuentes**

### **¿Puedo usar el mismo lab para QA y PROD?**
Sí, pero no simultáneamente. Tendrías que:
1. Desplegar QA → Screenshots → Destroy
2. Desplegar PROD → Screenshots → Destroy

### **¿Qué pasa si mi lab expira mientras tengo recursos?**
Los recursos seguirán corriendo, pero no podrás modificarlos hasta que inicies un nuevo lab. **Importante:** Destruye los recursos antes de que expire el lab para evitar costos.

### **¿Puedo usar las mismas credenciales para QA y PROD?**
Sí, si usas el mismo lab. Pero si usas 2 labs diferentes, cada uno tiene sus propias credenciales.

### **¿Cómo sé cuántos labs tengo disponibles?**
Revisa tu dashboard de AWS Academy. Normalmente muestra "Available Labs" o similar.

---

## 📝 **Checklist Pre-Despliegue**

- [ ] Verificar cuántos labs tienes disponibles
- [ ] Iniciar lab(s) en AWS Academy
- [ ] Obtener credenciales (Access Key, Secret Key, Session Token)
- [ ] Configurar secrets en GitHub
- [ ] Verificar que `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN` estén configurados
- [ ] Revisar límites de costo en AWS Academy
- [ ] Tener plan de destrucción (`terraform destroy`) listo

---

**💡 Tip:** Si solo tienes 1 lab disponible, despliega QA primero, toma screenshots, destruye, y luego despliega PROD. Esto te permite cumplir con la rúbrica usando solo 1 lab.
