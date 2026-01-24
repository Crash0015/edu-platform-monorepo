# AWS Academy bloquea CreateSecurityGroup - usar Security Group existente o default
variable "security_group_id" {
  description = "Security Group ID existente para bastion (opcional - si no se proporciona, se intenta usar default)"
  type        = string
  default     = ""
}

# Intentar obtener Security Group default si no se proporciona uno
data "aws_security_group" "default" {
  count = var.security_group_id == "" ? 1 : 0
  name  = "default"
  vpc_id = var.vpc_id
}

locals {
  bastion_sg_id = var.security_group_id != "" ? var.security_group_id : (length(data.aws_security_group.default) > 0 ? data.aws_security_group.default[0].id : "")
}

resource "aws_instance" "bastion" {
  ami                         = var.ami_id != "" ? var.ami_id : "ami-0c55b159cbfafe1f0" # Amazon Linux 2 us-east-1
  instance_type               = "t3.micro"
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = local.bastion_sg_id != "" ? [local.bastion_sg_id] : []
  associate_public_ip_address = true
  key_name                    = var.key_name != null ? var.key_name : (var.create_key_pair ? aws_key_pair.bastion[0].key_name : null)
  tags = {
    Name = "${var.environment}-bastion"
  }
}

output "public_ip" {
  value = aws_instance.bastion.public_ip
}
