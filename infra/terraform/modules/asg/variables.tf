variable "vpc_id" {
  description = "VPC ID for ASG"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "elb_target_group_arn" {
  description = "Target group ARN for ELB"
  type        = string
}

variable "elb_sg_id" {
  description = "Security Group ID of the ELB/ALB allowed to reach instances"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for ASG instances"
  type        = string
  default     = "t3.micro"
}

variable "instance_port" {
  description = "Port exposed by the workload running on the instances"
  type        = number
  default     = 80
}

variable "min_size" {
  description = "ASG minimum size (use 2+ for high availability)"
  type        = number
  default     = 2
}

variable "max_size" {
  description = "ASG maximum size"
  type        = number
  default     = 4
}

variable "desired_capacity" {
  description = "ASG desired capacity"
  type        = number
  default     = 2
}

variable "enable_default_user_data" {
  description = "If true, installs Docker and runs an Nginx container that answers /health (demo workload)"
  type        = bool
  default     = true
}

variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}
