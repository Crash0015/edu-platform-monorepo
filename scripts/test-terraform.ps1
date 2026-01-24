# Script para probar terraform plan con credenciales
param(
    [string]$AccessKey = "",
    [string]$SecretKey = "",
    [string]$SessionToken = ""
)

Write-Host "Probando configuración de Terraform..." -ForegroundColor Yellow
Set-Location infra/terraform/qa

# Configurar credenciales como variables de entorno
if ($AccessKey) { $env:AWS_ACCESS_KEY_ID = $AccessKey }
if ($SecretKey) { $env:AWS_SECRET_ACCESS_KEY = $SecretKey }
if ($SessionToken) { $env:AWS_SESSION_TOKEN = $SessionToken }

Write-Host "Ejecutando terraform plan..." -ForegroundColor Cyan
terraform plan

$exitCode = $LASTEXITCODE
if ($exitCode -eq 0) {
    Write-Host "✅ Terraform plan ejecutado exitosamente!" -ForegroundColor Green
} else {
    Write-Host "❌ Terraform plan falló con código: $exitCode" -ForegroundColor Red
    Write-Host "Revisa los errores arriba" -ForegroundColor Yellow
}

Set-Location ../../../
Write-Host "Prueba completada" -ForegroundColor Green