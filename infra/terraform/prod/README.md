## PROD (us-east-1) - Bastion + ALB + ASG + API Gateway (HA)

Este entorno está pensado para evidencia de rúbrica:
- **Jump box** (EC2 Bastion)
- **ELB + ASG** (ALB público + ASG en privadas)
- **High availability**: subnets en 2 AZs + `asg_min_size=2` + NAT por AZ (por defecto)
- **API Gateway**: HTTP API que hace proxy al ALB

### Pasos

1. Copia `terraform.tfvars.example` a `terraform.tfvars` (NO commitear).
2. Completa credenciales del AWS Academy Lab (Access/Secret/Session Token).
3. Ejecuta:

```powershell
cd infra/terraform/prod
terraform init
terraform plan
terraform apply
```

### Seguridad

En PROD **no uses** `0.0.0.0/0` para SSH. Define `bastion_allowed_ssh_cidrs = ["TU_IP_PUBLICA/32"]`.

