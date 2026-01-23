variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}

variable "service_name" {
  description = "Name of the microservice (e.g., auth-service, api-gateway)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where ECS service will run"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID of the ALB"
  type        = string
}

variable "target_group_arn" {
  description = "ARN of the ALB target group for this service"
  type        = string
}

variable "docker_image" {
  description = "Docker image name (e.g., username/edu-auth-service)"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag (e.g., latest, sha-abc123)"
  type        = string
  default     = "latest"
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
}

variable "task_cpu" {
  description = "CPU units for the task (256, 512, 1024, 2048, 4096)"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memory in MB for the task (512, 1024, 2048, 4096, 8192, 16384)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of tasks to run"
  type        = number
  default     = 1
}

variable "environment_variables" {
  description = "Environment variables for the container"
  type        = list(map(string))
  default     = []
}

variable "health_check_command" {
  description = "Health check command (e.g., [\"CMD-SHELL\", \"curl -f http://localhost:3000/health || exit 1\"])"
  type        = list(string)
  default     = ["CMD-SHELL", "echo ok"]
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}
