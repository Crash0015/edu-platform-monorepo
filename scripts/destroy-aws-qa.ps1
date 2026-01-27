# Script para destruir toda la infraestructura de QA en AWS
# Ejecuta terraform destroy para eliminar todos los recursos

Write-Host "========================================" -ForegroundColor Red
Write-Host "⚠️  ADVERTENCIA: DESTRUCCIÓN DE RECURSOS" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Este script eliminará TODA la infraestructura de QA en AWS:" -ForegroundColor Yellow
Write-Host "  - VPC y subnets" -ForegroundColor White
Write-Host "  - Load Balancer (ELB)" -ForegroundColor White
Write-Host "  - Auto Scaling Group y todas las instancias EC2" -ForegroundColor White
Write-Host "  - Bastion host" -ForegroundColor White
Write-Host "  - Security Groups" -ForegroundColor White
Write-Host "  - NAT Gateway" -ForegroundColor White
Write-Host "  - Elastic IPs" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar)"

if ($confirm -ne "SI") {
    Write-Host ""
    Write-Host "Operación cancelada." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Iniciando destrucción de infraestructura..." -ForegroundColor Yellow
Write-Host ""

# Cambiar al directorio de Terraform QA
$terraformDir = "infra/terraform/qa"
if (-not (Test-Path $terraformDir)) {
    Write-Host "Error: No se encontró el directorio $terraformDir" -ForegroundColor Red
    exit 1
}

Push-Location $terraformDir

try {
    # Verificar que terraform está disponible
    $terraformVersion = terraform version
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Terraform no está instalado o no está en el PATH" -ForegroundColor Red
        exit 1
    }

    Write-Host "Terraform encontrado:" -ForegroundColor Green
    Write-Host $terraformVersion -ForegroundColor Gray
    Write-Host ""

    # Inicializar Terraform (por si acaso)
    Write-Host "Inicializando Terraform..." -ForegroundColor Cyan
    terraform init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error al inicializar Terraform" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "Ejecutando terraform destroy..." -ForegroundColor Yellow
    Write-Host "Esto puede tardar varios minutos..." -ForegroundColor Gray
    Write-Host ""

    # Ejecutar destroy con auto-approve
    terraform destroy -auto-approve

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ INFRAESTRUCTURA ELIMINADA EXITOSAMENTE" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Todos los recursos han sido eliminados de AWS." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "❌ ERROR AL ELIMINAR RECURSOS" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Revisa los errores arriba. Algunos recursos pueden no haberse eliminado." -ForegroundColor Yellow
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Operacion completada." -ForegroundColor Green
