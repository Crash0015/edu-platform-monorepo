# Script para DESTRUIR TODO en AWS (QA Lab)
# ADVERTENCIA: Esto eliminará TODOS los recursos de AWS
# Uso: .\scripts\destroy-all-aws.ps1

Write-Host "========================================" -ForegroundColor Red
Write-Host "DESTRUCCION COMPLETA DE AWS" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
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

Write-Host "ADVERTENCIA CRITICA:" -ForegroundColor Red
Write-Host "  Esto destruira TODOS los recursos de AWS:" -ForegroundColor Yellow
Write-Host "    - VPC y subnets" -ForegroundColor Gray
Write-Host "    - Bastion Host" -ForegroundColor Gray
Write-Host "    - ELB/ALB" -ForegroundColor Gray
Write-Host "    - Auto Scaling Group" -ForegroundColor Gray
Write-Host "    - Security Groups" -ForegroundColor Gray
Write-Host "    - Instancias EC2" -ForegroundColor Gray
Write-Host "    - Elastic IPs" -ForegroundColor Gray
Write-Host "    - Volumenes" -ForegroundColor Gray
Write-Host ""
Write-Host "¿Estas SEGURO que quieres continuar?" -ForegroundColor Red
Write-Host "Escribe 'DESTROY ALL' para confirmar:" -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne "DESTROY ALL") {
    Write-Host "Destruccion cancelada" -ForegroundColor Yellow
    Set-Location ..\..\..
    exit 0
}

Write-Host ""
Write-Host "Leyendo credenciales de terraform.tfvars..." -ForegroundColor Yellow

# Leer credenciales de terraform.tfvars si existen
$tfvarsContent = Get-Content "terraform.tfvars" -Raw -ErrorAction SilentlyContinue
if ($tfvarsContent) {
    if ($tfvarsContent -match 'aws_access_key\s*=\s*"([^"]+)"') {
        $env:AWS_ACCESS_KEY_ID = $matches[1]
        Write-Host "  AWS_ACCESS_KEY_ID configurado desde terraform.tfvars" -ForegroundColor Gray
    }
    if ($tfvarsContent -match 'aws_secret_key\s*=\s*"([^"]+)"') {
        $env:AWS_SECRET_ACCESS_KEY = $matches[1]
        Write-Host "  AWS_SECRET_ACCESS_KEY configurado desde terraform.tfvars" -ForegroundColor Gray
    }
    if ($tfvarsContent -match 'aws_session_token\s*=\s*"([^"]+)"') {
        $env:AWS_SESSION_TOKEN = $matches[1]
        Write-Host "  AWS_SESSION_TOKEN configurado desde terraform.tfvars" -ForegroundColor Gray
    }
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
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "TODO DESTRUIDO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Todos los recursos de AWS han sido eliminados." -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Error durante la destruccion" -ForegroundColor Red
    Write-Host "Revisa los errores arriba" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Si hay recursos que no se pueden destruir automaticamente," -ForegroundColor Yellow
    Write-Host "debes eliminarlos manualmente desde AWS Console." -ForegroundColor Yellow
}

Set-Location ..\..\..
