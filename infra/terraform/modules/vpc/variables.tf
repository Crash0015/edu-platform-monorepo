variable "cidr_block" {
  description = "CIDR block for the VPC (no se usa - usamos VPC default)"
  type        = string
  default     = ""
}

variable "enable_nat_gateway" {
  description = "Whether to create NAT Gateway(s) - DESHABILITADO (usamos VPC default)"
  type        = bool
  default     = false
}

variable "nat_gateway_per_az" {
  description = "If true, create one NAT Gateway per public subnet/AZ - DESHABILITADO"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}
