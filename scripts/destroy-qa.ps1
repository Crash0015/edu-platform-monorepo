# Script para destruir recursos de QA
# Uso: .\scripts\destroy-qa.ps1

Write-Host "Destruyendo recursos de QA..." -ForegroundColor Yellow
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "infra\terraform\qa\main.tf")) {
    Write-Host "Error: Debes ejecutar este script desde la raiz del proyecto" -ForegroundColor Red
    exit 1
}

# Cambiar al directorio de QA
Set-Location "infra\terraform\qa"

# Verificar que terraform.tfvars existe
if (-not (Test-Path "terraform.tfvars")) {
    Write-Host "Error: terraform.tfvars no existe. No hay nada que destruir." -ForegroundColor Red
    Set-Location ..\..\..
    exit 1
}

Write-Host "ADVERTENCIA: Esto destruira TODOS los recursos de QA" -ForegroundColor Red
Write-Host "   - VPC y subnets" -ForegroundColor Gray
Write-Host "   - Bastion Host" -ForegroundColor Gray
Write-Host "   - ELB" -ForegroundColor Gray
Write-Host "   - ASG" -ForegroundColor Gray
Write-Host "   - API Gateway" -ForegroundColor Gray
Write-Host "   - ECS Services (si existen)" -ForegroundColor Gray
Write-Host ""
Write-Host "Estas seguro? (escribe 'yes' para continuar):" -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne "yes") {
    Write-Host "Destruccion cancelada" -ForegroundColor Yellow
    Set-Location ..\..\..
    exit 0
}

Write-Host ""
Write-Host "Inicializando Terraform..." -ForegroundColor Yellow
$env:Path=[System.Environment]::GetEnvironmentVariable('Path','Machine')+';'+[System.Environment]::GetEnvironmentVariable('Path','User')
terraform init

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al inicializar Terraform" -ForegroundColor Red
    Set-Location ..\..\..
    exit 1
}

Write-Host ""
Write-Host "Ejecutando terraform destroy..." -ForegroundColor Red
terraform destroy -auto-approve

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Recursos de QA destruidos exitosamente!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Error durante la destruccion" -ForegroundColor Red
    Write-Host "   Revisa los errores arriba" -ForegroundColor Yellow
}

Set-Location ..\..\..
