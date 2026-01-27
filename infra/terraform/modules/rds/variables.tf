variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for RDS"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs for RDS subnet group"
  type        = list(string)
}

variable "asg_security_group_id" {
  description = "Security Group ID of ASG instances (para permitir acceso a RDS)"
  type        = string
}

variable "bastion_sg_id" {
  description = "Security Group ID of the Bastion host (para permitir SSH y debugging)"
  type        = string
  default     = ""
}

variable "instance_class" {
  description = "RDS instance class (db.t3.micro para AWS Academy)"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_username" {
  description = "Master username for RDS"
  type        = string
  default     = "edu"
  sensitive   = true
}

variable "db_password" {
  description = "Master password for RDS"
  type        = string
  sensitive   = true
}

variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on destroy (true para QA/testing)"
  type        = bool
  default     = true
}

variable "create_schedule_db" {
  description = "Create RDS instance for schedule service"
  type        = bool
  default     = true
}

variable "create_tutoring_db" {
  description = "Create RDS instance for tutoring service"
  type        = bool
  default     = true
}
