## AWS / Terraform (QA + PROD) — us-east-1

Esto implementa los puntos de rúbrica de AWS:

- **VPC multi-AZ** (2 AZs) con **subnets públicas/privadas**
- **EC2 Bastion / Jump Box**
- **ALB (ELBv2) + ASG** con mínimo 2 instancias (High Availability)
- **API Gateway (AWS)**: HTTP API que hace proxy hacia el ALB
- **Terraform**: módulos reutilizables + ambientes QA/PROD

### Cómo usar (AWS Academy Labs)

En AWS Academy normalmente obtienes credenciales temporales:
- `aws_access_key`
- `aws_secret_key`
- `aws_session_token`

#### QA (lab temporal 1)

1. Copia `infra/terraform/qa/terraform.tfvars.example` a `infra/terraform/qa/terraform.tfvars` (**NO commitear**)
2. Ejecuta:

```powershell
cd infra/terraform/qa
terraform init
terraform plan
terraform apply
```

#### PROD (lab temporal 2)

1. Copia `infra/terraform/prod/terraform.tfvars.example` a `infra/terraform/prod/terraform.tfvars` (**NO commitear**)
2. Ejecuta:

```powershell
cd infra/terraform/prod
terraform init
terraform plan
terraform apply
```

### Outputs para evidencias

- `bastion_public_ip`
- `elb_dns_name` / `alb_dns_name`
- `api_gateway_url`
- `asg_name`

