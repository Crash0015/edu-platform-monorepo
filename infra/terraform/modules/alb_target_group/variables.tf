variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}

variable "service_name" {
  description = "Name of the microservice"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "listener_arn" {
  description = "ARN of the ALB listener"
  type        = string
}

variable "port" {
  description = "Port for the target group"
  type        = number
  default     = 80
}

variable "protocol" {
  description = "Protocol for the target group"
  type        = string
  default     = "HTTP"
}

variable "path_patterns" {
  description = "List of path patterns to route to this target group (e.g., [/api/v1/auth/*])"
  type        = list(string)
}

variable "priority" {
  description = "Priority for the listener rule (must be unique)"
  type        = number
}

variable "health_check_path" {
  description = "Health check path"
  type        = string
  default     = "/health"
}

variable "health_check_protocol" {
  description = "Health check protocol"
  type        = string
  default     = "HTTP"
}

variable "health_check_matcher" {
  description = "HTTP status codes for healthy checks"
  type        = string
  default     = "200-399"
}

variable "healthy_threshold" {
  description = "Number of consecutive successful health checks"
  type        = number
  default     = 2
}

variable "unhealthy_threshold" {
  description = "Number of consecutive failed health checks"
  type        = number
  default     = 2
}

variable "timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
}

variable "interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}
