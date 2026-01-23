variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}

variable "alb_dns_name" {
  description = "Public ALB DNS name to proxy to"
  type        = string
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "$default"
}

