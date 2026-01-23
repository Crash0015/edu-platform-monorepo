variable "cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "enable_nat_gateway" {
  description = "Whether to create NAT Gateway(s) for private subnets"
  type        = bool
  default     = true
}

variable "nat_gateway_per_az" {
  description = "If true, create one NAT Gateway per public subnet/AZ (higher cost, higher availability)"
  type        = bool
  default     = true
}

variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}
