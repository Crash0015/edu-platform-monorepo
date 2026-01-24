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

# Variables de VPC - opcionales con valores por defecto
# Si AWS Academy permite, se pueden dejar vacíos y Terraform usará defaults
variable "vpc_id" {
  description = "VPC ID (opcional - dejar vacío para intentar usar default)"
  type        = string
  default     = ""
}

variable "subnet_ids" {
  description = "Lista de subnet IDs (opcional - dejar vacío para intentar usar defaults)"
  type        = list(string)
  default     = []
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

