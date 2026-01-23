# Estrategia de Branching y PRs

## 🎯 **Problema del Usuario**

- Trabajas en `main` directamente
- Tu docente quiere que hagas un PR a `prod`
- Si el docente no aprueba, ¿cómo pruebas?

## ✅ **Solución Recomendada**

### **Opción 1: Branching Simple (Recomendado para tu caso)**

```
main (desarrollo) → PR → prod (producción)
```

**Flujo:**
1. Trabajas en `main` normalmente
2. Cuando quieras desplegar a PROD:
   - Creas branch `release/prod-v1.0.0` desde `main`
   - Haces PR de `release/prod-v1.0.0` → `prod`
   - El docente aprueba
   - Si no aprueba, puedes probar en QA primero

### **Opción 2: GitFlow (Más Complejo)**

```
main (desarrollo)
  ↓
develop (rama de desarrollo)
  ↓
feature/* (nuevas features)
  ↓
release/* (preparación para prod)
  ↓
prod (producción)
```

---

## 🚀 **Estrategia Práctica para Tu Caso**

### **Paso 1: Configurar Branches**

```bash
# Crear branch prod (si no existe)
git checkout -b prod
git push origin prod

# Volver a main
git checkout main
```

### **Paso 2: Trabajo Diario**

```bash
# Trabajas en main normalmente
git checkout main
# ... haces cambios ...
git add .
git commit -m "feat: nueva feature"
git push origin main
```

**Esto automáticamente:**
- Ejecuta CI/CD (tests, build, docker push)
- Despliega a QA (si hay cambios en `infra/terraform/qa/`)

### **Paso 3: Cuando Quieras Desplegar a PROD**

```bash
# 1. Asegúrate de que main está estable
git checkout main
git pull origin main

# 2. Crea branch de release
git checkout -b release/prod-v1.0.0

# 3. Haces PR en GitHub:
# release/prod-v1.0.0 → prod
```

**El docente puede:**
- Revisar el PR
- Aprobar o pedir cambios
- Si aprueba, se mergea a `prod` y se despliega automáticamente

### **Paso 4: Si el Docente No Aprueba Inmediatamente**

**Puedes probar en QA primero:**

```bash
# Ya tienes QA desplegado y funcionando
# Puedes probar todo ahí antes del PR
```

**O probar manualmente en PROD (si tienes acceso):**

```bash
# Usar workflow manual de GitHub Actions
# Actions → Terraform Infrastructure → Run workflow
# Seleccionar: environment=prod, action=plan
```

---

## 📋 **GitHub Secrets Necesarios**

### **Para QA (Lab 1):**
- `AWS_ACCESS_KEY_ID_QA`
- `AWS_SECRET_ACCESS_KEY_QA`
- `AWS_SESSION_TOKEN_QA`

### **Para PROD (Lab 2):**
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`
- `AWS_SESSION_TOKEN_PROD`

### **Comunes:**
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

---

## 🔄 **Flujo Completo de CI/CD**

```
1. Push a main
   ↓
2. CI ejecuta: tests, build, docker push
   ↓
3. Si hay cambios en infra/terraform/qa/:
   → Terraform despliega a QA automáticamente
   ↓
4. Creas PR: release/* → prod
   ↓
5. Docente aprueba
   ↓
6. Merge a prod
   ↓
7. CI ejecuta: tests, build, docker push
   ↓
8. Terraform despliega a PROD automáticamente
```

---

## 💡 **Recomendación Final**

**Para tu caso específico:**

1. **Mantén `main` como rama de desarrollo**
2. **Crea `prod` como rama de producción**
3. **Haz PRs de `main` → `prod` cuando quieras desplegar**
4. **Prueba primero en QA antes de hacer PR a prod**
5. **Si el docente no aprueba, puedes seguir trabajando en `main` y probando en QA**

---

## 🛠️ **Comandos Útiles**

```bash
# Ver branches
git branch -a

# Crear branch prod
git checkout -b prod
git push origin prod

# Crear PR desde main a prod
git checkout main
git checkout -b release/prod-v1.0.0
git push origin release/prod-v1.0.0
# Luego crear PR en GitHub UI
```
