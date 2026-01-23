# Script para configurar credenciales de QA
# Uso: .\scripts\setup-qa-credentials.ps1

Write-Host "🔑 Configurando credenciales de QA (Lab 1)" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "infra\terraform\qa\main.tf")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Crear terraform.tfvars si no existe
if (-not (Test-Path "infra\terraform\qa\terraform.tfvars")) {
    Write-Host "📝 Creando terraform.tfvars desde ejemplo..." -ForegroundColor Yellow
    Copy-Item "infra\terraform\qa\terraform.tfvars.example" "infra\terraform\qa\terraform.tfvars"
}

Write-Host "📋 INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a AWS Academy y inicia un Lab (Lab 1 para QA)" -ForegroundColor White
Write-Host "2. Click en 'AWS Details' o 'Show' para ver credenciales" -ForegroundColor White
Write-Host "3. Copia estos 3 valores:" -ForegroundColor White
Write-Host "   - AWS_ACCESS_KEY_ID" -ForegroundColor Gray
Write-Host "   - AWS_SECRET_ACCESS_KEY" -ForegroundColor Gray
Write-Host "   - AWS_SESSION_TOKEN" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Presiona Enter cuando tengas las credenciales listas..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "🔑 Ingresa tus credenciales (NO se mostrarán en pantalla):" -ForegroundColor Cyan
Write-Host ""

$accessKey = Read-Host "AWS Access Key ID" -AsSecureString
$secretKey = Read-Host "AWS Secret Access Key" -AsSecureString
$sessionToken = Read-Host "AWS Session Token" -AsSecureString

# Convertir SecureString a texto plano (necesario para guardar en archivo)
$accessKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($accessKey)
)
$secretKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretKey)
)
$sessionTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sessionToken)
)

# Leer el archivo actual
$tfvarsPath = "infra\terraform\qa\terraform.tfvars"
$content = Get-Content $tfvarsPath -Raw

# Reemplazar los valores
$content = $content -replace 'aws_access_key\s*=\s*"[^"]*"', "aws_access_key = `"$accessKeyPlain`""
$content = $content -replace 'aws_secret_key\s*=\s*"[^"]*"', "aws_secret_key = `"$secretKeyPlain`""
$content = $content -replace 'aws_session_token\s*=\s*"[^"]*"', "aws_session_token = `"$sessionTokenPlain`""

# Guardar
Set-Content -Path $tfvarsPath -Value $content -NoNewline

Write-Host ""
Write-Host "✅ Credenciales guardadas en infra\terraform\qa\terraform.tfvars" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Verificando que las credenciales estén correctas..." -ForegroundColor Yellow

# Verificar que se guardaron (sin mostrar los valores completos)
$saved = Get-Content $tfvarsPath
$hasAccessKey = $saved | Select-String -Pattern 'aws_access_key\s*=\s*"[^"]{10,}"' -Quiet
$hasSecretKey = $saved | Select-String -Pattern 'aws_secret_key\s*=\s*"[^"]{10,}"' -Quiet
$hasSessionToken = $saved | Select-String -Pattern 'aws_session_token\s*=\s*"[^"]{10,}"' -Quiet

if ($hasAccessKey -and $hasSecretKey -and $hasSessionToken) {
    Write-Host "✅ Credenciales guardadas correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Ahora puedes ejecutar: .\scripts\deploy-qa.ps1" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Algo salió mal. Por favor edita manualmente:" -ForegroundColor Yellow
    Write-Host "   infra\terraform\qa\terraform.tfvars" -ForegroundColor Gray
}
