# AWS Academy - Optimización de Costos

## Configuración para límite de 10 instancias y $50

### Recursos configurados:

1. **VPC** (1 recurso)
   - 1 VPC con CIDR /16
   - 2 subnets públicas
   - 2 subnets privadas
   - 1 Internet Gateway
   - 1 NAT Gateway (solo 1 para ahorrar costos)

2. **Bastion Host** (1 instancia)
   - t3.micro (más barato que t3.small)
   - Solo 1 instancia

3. **Auto Scaling Group** (máximo 8 instancias)
   - Máximo: 8 instancias
   - Deseado: 2 instancias
   - Mínimo: 1 instancia
   - Tipo: t3.micro
   - Total instancias: 2-8 (ajustable)

4. **Application Load Balancer** (1 recurso)
   - 1 ALB compartido para todos los servicios

### Total de instancias:
- Bastion: 1
- ASG: 2-8
- **Total máximo: 9 instancias** (dentro del límite de 10)

### Costos estimados mensuales (us-east-1):

| Recurso | Cantidad | Costo/hora | Costo/mes |
|---------|----------|------------|-----------|
| t3.micro (Bastion) | 1 | $0.0116 | $8.35 |
| t3.micro (ASG avg) | 2 | $0.0116 | $16.70 |
| NAT Gateway | 1 | $0.045 | $32.40 |
| ALB | 1 | $0.0225 | $16.20 |
| **Total estimado** | | | **$73.65/mes** |

### Optimizaciones aplicadas:

1. **Instancias t3.micro** en lugar de t3.small (50% más baratas)
2. **Máximo 8 instancias en ASG** (dejando margen para bastion)
3. **Solo 1 NAT Gateway** (en lugar de 2)
4. **Sin RDS/ElastiCache** (usando solo EC2)
5. **Docker Compose en EC2** (sin ECS Fargate que es más caro)

### Configuración de terraform.tfvars:

```hcl
# AWS Academy credentials
aws_access_key     = "TU_ACCESS_KEY"
aws_secret_key     = "TU_SECRET_KEY"  
aws_session_token  = "TU_SESSION_TOKEN"

# Configuración optimizada
aws_region   = "us-east-1"
environment  = "qa"
vpc_cidr     = "10.10.0.0/16"

# NAT Gateway económico
enable_nat_gateway = true
nat_gateway_per_az = false  # Solo 1 NAT Gateway

# Bastion (1 instancia t3.micro)
bastion_key_name = "tu-key-exist"  # Debe existir previamente
bastion_allowed_ssh_cidrs = ["0.0.0.0/0"]  # Restringir a tu IP

# Docker images (opcional)
dockerhub_username = "tu-usuario-dockerhub"
image_tag = "latest"
```

### Notas importantes:

1. **Costo real será menor** si usas las instancias solo por horas/días
2. **Puedes reducir aún más** usando solo 1 instancia en ASG
3. **Considera usar spot instances** para ahorrar 70% (si AWS Academy permite)
4. **Monitorea el uso** en AWS Console > Billing
5. **Destruye cuando no uses** para evitar cargos

### Comandos para verificar costos:

```bash
# Ver recursos actuales
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,State.Name]' --output table

# Ver costos estimados
aws ce get-cost-forecast --time-period Start=$(date -d 'today' +%Y-%m-%d),End=$(date -d '+30 days' +%Y-%m-%d) --metric UNBLENDED_COST --granularity MONTHLY
```