# Script de despliegue rápido para QA
# Uso: .\scripts\deploy-qa.ps1

Write-Host "🚀 Desplegando QA Environment..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "infra\terraform\qa\main.tf")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar que terraform.tfvars existe
if (-not (Test-Path "infra\terraform\qa\terraform.tfvars")) {
    Write-Host "⚠️  terraform.tfvars no existe. Creando desde ejemplo..." -ForegroundColor Yellow
    Copy-Item "infra\terraform\qa\terraform.tfvars.example" "infra\terraform\qa\terraform.tfvars"
    Write-Host "📝 Por favor, edita infra\terraform\qa\terraform.tfvars con tus credenciales del Lab 1" -ForegroundColor Yellow
    Write-Host "   Presiona Enter cuando hayas editado el archivo..."
    Read-Host
}

# Cambiar al directorio de QA
Set-Location "infra\terraform\qa"

Write-Host "📦 Inicializando Terraform..." -ForegroundColor Yellow
terraform init

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al inicializar Terraform" -ForegroundColor Red
    Set-Location ..\..\..
    exit 1
}

Write-Host ""
Write-Host "🔍 Ejecutando terraform plan..." -ForegroundColor Yellow
terraform plan

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en terraform plan" -ForegroundColor Red
    Set-Location ..\..\..
    exit 1
}

Write-Host ""
Write-Host "⚠️  Revisa el plan arriba. ¿Deseas continuar con terraform apply? (S/N)" -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne "S" -and $confirm -ne "s" -and $confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ Despliegue cancelado" -ForegroundColor Red
    Set-Location ..\..\..
    exit 0
}

Write-Host ""
Write-Host "🚀 Aplicando cambios..." -ForegroundColor Green
terraform apply

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Outputs:" -ForegroundColor Cyan
    terraform output
} else {
    Write-Host "❌ Error durante el despliegue" -ForegroundColor Red
}

Set-Location ..\..\..
