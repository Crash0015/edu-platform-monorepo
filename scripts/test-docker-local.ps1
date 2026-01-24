# Script para probar todos los servicios en Docker Desktop local
# Uso: .\scripts\test-docker-local.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA DE SERVICIOS EN DOCKER DESKTOP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker Desktop esté corriendo
Write-Host "Verificando Docker Desktop..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker Desktop está corriendo" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Docker Desktop NO está corriendo" -ForegroundColor Red
    Write-Host "  Por favor abre Docker Desktop y espera a que esté listo" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Levantando infraestructura (bases de datos, Kafka, Redis, etc.)..." -ForegroundColor Yellow
Set-Location infra/docker
docker-compose --profile dev --profile infra up -d postgres postgres-enrollment postgres-course postgres-schedule postgres-tutoring mongo redis zookeeper kafka rabbitmq mqtt

Write-Host ""
Write-Host "Esperando 15 segundos para que la infraestructura esté lista..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "Levantando servicios principales..." -ForegroundColor Yellow
docker-compose --profile dev --profile services up -d auth-service user-service course-service enrollment-service

Write-Host ""
Write-Host "Esperando 10 segundos para que los servicios principales estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Levantando servicios restantes..." -ForegroundColor Yellow
docker-compose --profile dev --profile services up -d schedule-service tutoring-service search-service material-service notification-service automation-service api-gateway

Write-Host ""
Write-Host "Esperando 10 segundos para que todos los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Levantando frontend..." -ForegroundColor Yellow
docker-compose --profile dev --profile frontend up -d web-dashboard

Write-Host ""
Write-Host "Esperando 5 segundos para que el frontend esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO ESTADO DE LOS SERVICIOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar contenedores
Write-Host "Contenedores corriendo:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String -Pattern "edu-"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PROBANDO ENDPOINTS DE SALUD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Auth Service"; Url="http://localhost:3001/health"; Port=3001},
    @{Name="User Service"; Url="http://localhost:3008/health"; Port=3008},
    @{Name="Course Service"; Url="http://localhost:3004/health"; Port=3004},
    @{Name="Enrollment Service"; Url="http://localhost:3007/health"; Port=3007},
    @{Name="Schedule Service"; Url="http://localhost:3009/health"; Port=3009},
    @{Name="Tutoring Service"; Url="http://localhost:3010/health"; Port=3010},
    @{Name="Search Service"; Url="http://localhost:3011/health"; Port=3011},
    @{Name="Material Service"; Url="http://localhost:3012/health"; Port=3012},
    @{Name="Notification Service"; Url="http://localhost:3005/health"; Port=3005},
    @{Name="Automation Service"; Url="http://localhost:3006/health"; Port=3006},
    @{Name="API Gateway"; Url="http://localhost:3000/health"; Port=3000}
)

$successCount = 0
$failCount = 0

foreach ($service in $services) {
    try {
        $response = Invoke-RestMethod -Uri $service.Url -Method Get -TimeoutSec 5
        Write-Host "✓ $($service.Name): OK" -ForegroundColor Green
        Write-Host "  Status: $($response.status)" -ForegroundColor Gray
        $successCount++
    } catch {
        Write-Host "✗ $($service.Name): ERROR" -ForegroundColor Red
        Write-Host "  URL: $($service.Url)" -ForegroundColor Gray
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
        $failCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servicios OK: $successCount" -ForegroundColor Green
Write-Host "Servicios con error: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "¡TODOS LOS SERVICIOS ESTÁN FUNCIONANDO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Puedes acceder a:" -ForegroundColor Yellow
    Write-Host "  - API Gateway: http://localhost:3000" -ForegroundColor White
    Write-Host "  - Swagger: http://localhost:3000/api/docs" -ForegroundColor White
    Write-Host "  - Frontend: http://localhost:3002" -ForegroundColor White
} else {
    Write-Host "Algunos servicios tienen problemas. Revisa los logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs [nombre-servicio]" -ForegroundColor White
}

Set-Location ..\..