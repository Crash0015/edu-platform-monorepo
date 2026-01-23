variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
  default     = "qa"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.10.0.0/16"
}

variable "enable_nat_gateway" {
  description = "Create NAT gateway(s) so instances in private subnets can reach the Internet (required for package pulls)"
  type        = bool
  default     = true
}

variable "nat_gateway_per_az" {
  description = "If true, 1 NAT per AZ (higher availability, higher cost). QA can use false to save cost."
  type        = bool
  default     = false
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
  description = "Lock down SSH to your public IP/CIDR (avoid 0.0.0.0/0 in PROD)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "aws_access_key" {
  description = "AWS Access Key ID"
  type        = string
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key"
  type        = string
}

variable "aws_session_token" {
  description = "AWS Session Token (para credenciales temporales)"
  type        = string
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
