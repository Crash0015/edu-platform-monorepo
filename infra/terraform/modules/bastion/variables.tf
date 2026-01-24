variable "vpc_id" {
  description = "VPC ID for Bastion host"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for Bastion host"
  type        = string
}

variable "key_name" {
  description = "EC2 Key Pair name for SSH access (optional but recommended). Si no se proporciona y create_key_pair=true, se crea uno automáticamente."
  type        = string
  default     = null
}

variable "create_key_pair" {
  description = "Si true, crea un EC2 Key Pair automáticamente (DESHABILITADO por defecto - AWS Academy no permite ImportKeyPair)"
  type        = bool
  default     = false
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH into the bastion (lock this to your public IP/CIDR)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "environment" {
  description = "Deployment environment (qa, prod)"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for Amazon Linux 2 (hardcoded to avoid DescribeImages permission in AWS Academy)"
  type        = string
  default     = "ami-0c55b159cbfafe1f0" # Amazon Linux 2 us-east-1
}

variable "security_group_id" {
  description = "Security Group ID existente para bastion (opcional - si no se proporciona, se intenta usar default)"
  type        = string
  default     = ""
}
