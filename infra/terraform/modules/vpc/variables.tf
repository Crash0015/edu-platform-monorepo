# Variables - AWS Academy bloquea DescribeVpcs/DescribeSubnets
# El usuario debe proporcionar VPC ID y subnet IDs manualmente

variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID existente (requerido - obtener de AWS Console)"
  type        = string
}

variable "subnet_ids" {
  description = "Lista de subnet IDs existentes (requerido - obtener de AWS Console)"
  type        = list(string)
}
