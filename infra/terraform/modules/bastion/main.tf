# AMI ID hardcodeado para AWS Academy (no tiene permisos para SSM GetParameter)
# Amazon Linux 2 AMI en us-east-1
locals {
  # AMI ID de Amazon Linux 2 en us-east-1
  # Si este AMI no funciona, usar el AMI de una instancia existente que funcione
  amazon_linux_2_ami = var.ami_id != "" ? var.ami_id : "ami-0c55b159cbfafe1f0"
}

resource "aws_security_group" "bastion" {
  name        = "${var.environment}-bastion-sg"
  description = "Allow SSH access to bastion host"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-bastion-sg"
  }
}

resource "aws_instance" "bastion" {
  ami                         = local.amazon_linux_2_ami
  instance_type               = "t3.micro"
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  associate_public_ip_address = true
  # NO requiere key_name - usamos EC2 Instance Connect automáticamente
  # key_name se deja como null para forzar el uso de EC2 Instance Connect
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "optional"  # Para AWS Academy que puede tener restricciones
  }
  tags = {
    Name = "${var.environment}-bastion"
  }
}

output "public_ip" {
  value = aws_instance.bastion.public_ip
}

output "instance_id" {
  description = "Instance ID of the Bastion host (para EC2 Instance Connect)"
  value       = aws_instance.bastion.id
}

output "security_group_id" {
  description = "Security Group ID of the Bastion host"
  value       = aws_security_group.bastion.id
}
