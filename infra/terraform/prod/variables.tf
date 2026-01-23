variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "enable_nat_gateway" {
  description = "Create NAT gateway(s) so instances in private subnets can reach the Internet"
  type        = bool
  default     = true
}

variable "nat_gateway_per_az" {
  description = "If true, 1 NAT per AZ (higher availability, higher cost)"
  type        = bool
  default     = true
}

variable "bastion_key_name" {
  description = "EC2 Key Pair name used by the bastion (opcional). Si no se proporciona y bastion_create_key_pair=true, se crea uno automáticamente."
  type        = string
  default     = null
}

variable "bastion_create_key_pair" {
  description = "Si true, crea un EC2 Key Pair automáticamente para el bastion"
  type        = bool
  default     = true
}

variable "bastion_allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH into the bastion (lock down to your IP/CIDR)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "asg_instance_type" {
  description = "EC2 instance type for ASG instances"
  type        = string
  default     = "t3.micro"
}

variable "asg_min_size" {
  description = "ASG minimum size (2+ for high availability)"
  type        = number
  default     = 2
}

variable "asg_max_size" {
  description = "ASG maximum size"
  type        = number
  default     = 4
}

variable "asg_desired_capacity" {
  description = "ASG desired capacity"
  type        = number
  default     = 2
}

variable "asg_enable_default_user_data" {
  description = "If true, installs Docker and runs demo Nginx workload that answers /health"
  type        = bool
  default     = true
}

variable "aws_access_key" {
  description = "AWS Access Key ID (opcional, puede usar AWS_ACCESS_KEY_ID env var)"
  type        = string
  default     = ""
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key (opcional, puede usar AWS_SECRET_ACCESS_KEY env var)"
  type        = string
  default     = ""
}

variable "aws_session_token" {
  description = "AWS Session Token (opcional, puede usar AWS_SESSION_TOKEN env var)"
  type        = string
  default     = ""
}

variable "dockerhub_username" {
  description = "DockerHub username (para construir nombres de imágenes)"
  type        = string
  default     = ""
}

variable "image_tag" {
  description = "Docker image tag to deploy (default: latest)"
  type        = string
  default     = "latest"
}
