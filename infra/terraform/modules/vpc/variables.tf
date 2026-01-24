# Variables simplificadas - usamos VPC default existente
# No necesitamos cidr_block, enable_nat_gateway, etc.

variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}
