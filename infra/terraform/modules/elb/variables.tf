variable "vpc_id" {
  description = "VPC ID for ELB"
  type        = string
}

variable "public_subnets" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "health_check_path" {
  description = "ALB target group health check path"
  type        = string
  default     = "/health"
}

variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}

variable "security_group_id" {
  description = "Security Group ID existente para ELB (opcional - si no se proporciona, se intenta usar default)"
  type        = string
  default     = ""
}
