variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for MongoDB"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "asg_security_group_id" {
  description = "Security Group ID of ASG instances (para permitir acceso a MongoDB)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for MongoDB"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID (opcional - si está vacío, usa SSM Parameter Store)"
  type        = string
  default     = ""
}

variable "db_name" {
  description = "MongoDB database name"
  type        = string
  default     = "search"
}
