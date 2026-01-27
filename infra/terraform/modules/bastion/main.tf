# Obtener AMI ID automáticamente desde SSM Parameter Store
# AWS mantiene este parámetro actualizado con el AMI más reciente de Amazon Linux 2
# Esto evita necesitar permisos de DescribeImages y funciona automáticamente en CI/CD
data "aws_ssm_parameter" "amazon_linux_2" {
  name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
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
  ami                         = var.ami_id != "" ? var.ami_id : data.aws_ssm_parameter.amazon_linux_2.value
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
