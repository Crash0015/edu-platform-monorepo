# AWS Academy bloquea DescribeVpcs, DescribeSubnets, etc.
# El usuario debe proporcionar VPC ID y subnet IDs manualmente
variable "vpc_id" {
  description = "VPC ID existente (requerido - obtener de AWS Console)"
  type        = string
}

variable "subnet_ids" {
  description = "Lista de subnet IDs existentes (requerido - obtener de AWS Console)"
  type        = list(string)
}

locals {
  vpc_id = var.vpc_id
}

output "vpc_id" {
  value = local.vpc_id
}

output "public_subnets" {
  # Usar las subnets proporcionadas por el usuario
  value = var.subnet_ids
}

output "private_subnets" {
  # Para simplificar, usar las mismas subnets
  value = var.subnet_ids
}

output "public_subnet_id" {
  # Usar la primera subnet proporcionada
  value = var.subnet_ids[0]
}
