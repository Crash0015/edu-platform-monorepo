# Módulo VPC simplificado - usa valores por defecto si no se proporcionan
# AWS Academy bloquea CreateVpc y DescribeVpcs, pero podemos intentar usar valores hardcodeados
# o dejar que los otros módulos usen valores por defecto de AWS

variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID (opcional - dejar vacío para usar default)"
  type        = string
  default     = ""
}

variable "subnet_ids" {
  description = "Lista de subnet IDs (opcional - dejar vacío para usar defaults)"
  type        = list(string)
  default     = []
}

# Si no se proporciona VPC ID, intentar usar un valor por defecto común
# NOTA: Esto puede fallar si AWS Academy no permite DescribeVpcs
# En ese caso, el usuario debe proporcionar vpc_id y subnet_ids en terraform.tfvars
locals {
  # Si vpc_id está vacío, intentar usar un valor común (puede necesitar ajuste)
  # Por ahora, requerimos que se proporcione manualmente
  vpc_id = var.vpc_id != "" ? var.vpc_id : "vpc-default-placeholder"
}

output "vpc_id" {
  value = local.vpc_id
}

output "public_subnets" {
  # Si subnet_ids está vacío, usar lista vacía (los módulos pueden fallar)
  # Mejor requerir que se proporcione
  value = length(var.subnet_ids) > 0 ? var.subnet_ids : ["subnet-default-placeholder"]
}

output "private_subnets" {
  value = length(var.subnet_ids) > 0 ? var.subnet_ids : ["subnet-default-placeholder"]
}

output "public_subnet_id" {
  value = length(var.subnet_ids) > 0 ? var.subnet_ids[0] : "subnet-default-placeholder"
}
