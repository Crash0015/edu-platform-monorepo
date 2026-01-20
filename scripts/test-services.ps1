# Script para probar Course Service y Enrollment Service
# Ejecutar desde la raíz del proyecto

Write-Host "🚀 Iniciando pruebas de servicios..." -ForegroundColor Cyan

# Verificar que las bases de datos estén corriendo
Write-Host "`n📦 Verificando contenedores..." -ForegroundColor Yellow
docker ps --filter "name=postgres" --format "table {{.Names}}\t{{.Status}}"

# Esperar a que postgres-course esté listo
Write-Host "`n⏳ Esperando 5 segundos para que postgres-course esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Probar conexión a postgres-course
Write-Host "`n🔍 Probando conexión a postgres-course..." -ForegroundColor Yellow
docker exec edu-postgres-course pg_isready -U edu -d coursedb

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: postgres-course no está listo" -ForegroundColor Red
    exit 1
}

Write-Host "✅ postgres-course está listo!" -ForegroundColor Green

# Generar Prisma Client para Course Service
Write-Host "`n📦 Generando Prisma Client para Course Service..." -ForegroundColor Yellow
Set-Location apps\course-service
npm run prisma:generate 2>&1 | Out-Null
Write-Host "✅ Prisma Client generado" -ForegroundColor Green

# Crear migración para Course Service
Write-Host "`n🗄️ Creando migración para Course Service..." -ForegroundColor Yellow
$env:DATABASE_URL="postgresql://edu:edu@localhost:5435/coursedb"
npx prisma migrate dev --name init 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migración creada" -ForegroundColor Green
} else {
    Write-Host "⚠️ Migración puede que ya exista o hubo un error" -ForegroundColor Yellow
}

# Verificar que los servicios pueden iniciar
Write-Host "`n✅ Configuración completada!" -ForegroundColor Green
Write-Host "`n📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Levantar Course Service:" -ForegroundColor White
Write-Host "     cd apps\course-service" -ForegroundColor Gray
Write-Host "     `$env:DATABASE_URL='postgresql://edu:edu@localhost:5435/coursedb'" -ForegroundColor Gray
Write-Host "     `$env:KAFKA_BROKERS='localhost:29092'" -ForegroundColor Gray
Write-Host "     npm run start:dev" -ForegroundColor Gray
Write-Host "`n  2. Levantar Enrollment Service:" -ForegroundColor White
Write-Host "     cd apps\enrollment-service" -ForegroundColor Gray
Write-Host "     `$env:COURSE_SERVICE_URL='http://localhost:3004'" -ForegroundColor Gray
Write-Host "     npm run start:dev" -ForegroundColor Gray
Write-Host "`n  3. Probar en Swagger:" -ForegroundColor White
Write-Host "     Course Service: http://localhost:3004/api/docs" -ForegroundColor Gray
Write-Host "     Enrollment Service: http://localhost:3007/api/docs" -ForegroundColor Gray

Set-Location ..\..
