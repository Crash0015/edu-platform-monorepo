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
  key_name                    = var.key_name != null ? var.key_name : (var.create_key_pair ? aws_key_pair.bastion[0].key_name : null)
  tags = {
    Name = "${var.environment}-bastion"
  }
}

output "public_ip" {
  value = aws_instance.bastion.public_ip
}
