# Script para destruir recursos de PROD
# Uso: .\scripts\destroy-prod.ps1

Write-Host "🧹 Destruyendo recursos de PROD..." -ForegroundColor Yellow
Write-Host ""

Set-Location "infra\terraform\prod"

Write-Host "⚠️  Esto destruirá TODOS los recursos de PROD. ¿Estás seguro? (S/N)" -ForegroundColor Red
$confirm = Read-Host

if ($confirm -ne "S" -and $confirm -ne "s" -and $confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
    Set-Location ..\..\..
    exit 0
}

terraform destroy

Set-Location ..\..\..
