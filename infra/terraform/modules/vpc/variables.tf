variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.10.0.0/16"
}

variable "enable_nat_gateway" {
  description = "Should be true if you want to provision NAT Gateways for private subnets"
  type        = bool
  default     = true
}

variable "nat_gateway_per_az" {
  description = "Should be true if you want to provision NAT Gateway per availability zone"
  type        = bool
  default     = false
}