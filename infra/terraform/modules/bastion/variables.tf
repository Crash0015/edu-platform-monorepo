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
  description = "Si true, crea un EC2 Key Pair automáticamente y guarda la clave privada localmente"
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
