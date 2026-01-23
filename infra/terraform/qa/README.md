# QA Environment Terraform

Este directorio contiene el código Terraform para desplegar el entorno QA en AWS. Ahora puedes usar tus credenciales de AWS directamente en variables, sin instalar AWS CLI ni configurar perfiles.

## Uso rápido

1. Copia `terraform.tfvars.example` a `terraform.tfvars` (NO commitear) y completa tus credenciales temporales del laboratorio:

   ```hcl
   aws_access_key = "TU_ACCESS_KEY"
   aws_secret_key = "TU_SECRET_KEY"
   aws_session_token = "TU_SESSION_TOKEN"
   ```

   (Puedes cambiar la región y otros valores si lo necesitas)

2. Ejecuta:
   ```sh
   terraform init
   terraform plan
   terraform apply
   ```

## Recursos

- VPC (multi-AZ)
- Bastion Host (EC2)
- Elastic Load Balancer (ELB)
- Auto Scaling Group (ASG)
- Security Groups

## Módulos

- VPC: Networking y subnets
- Bastion: Acceso SSH seguro
- ELB: Balanceo de carga
- ASG: Alta disponibilidad

## Outputs

- VPC ID
- Bastion Public IP
- ELB DNS Name
- ASG Name

---

**No necesitas instalar AWS CLI ni configurar perfiles locales. Solo Terraform y tus credenciales.**
