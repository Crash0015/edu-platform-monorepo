# Módulo MongoDB - Usando EC2 (más barato que DocumentDB para AWS Academy)
# Alternativa: DocumentDB (servicio administrado, más caro pero más robusto)

# Security Group para MongoDB
resource "aws_security_group" "mongodb" {
  name        = "${var.environment}-mongodb-sg"
  description = "Allow access to MongoDB from ASG instances"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [var.asg_security_group_id]
    description     = "MongoDB from ASG"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-mongodb-sg"
  }
}

# EC2 Instance para MongoDB
resource "aws_instance" "mongodb" {
  ami                         = var.ami_id != "" ? var.ami_id : data.aws_ssm_parameter.amazon_linux_2.value
  instance_type               = var.instance_type
  subnet_id                   = var.private_subnets[0]  # Primera subnet privada
  vpc_security_group_ids      = [aws_security_group.mongodb.id]
  associate_public_ip_address = false

  user_data = base64encode(templatefile("${path.module}/user_data_mongodb.sh.tftpl", {
    DB_NAME = var.db_name
  }))

  tags = {
    Name        = "${var.environment}-mongodb"
    Service     = "search-service"
    Environment = var.environment
  }
}

# Obtener AMI ID automáticamente
data "aws_ssm_parameter" "amazon_linux_2" {
  name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}

output "mongodb_endpoint" {
  description = "MongoDB endpoint (private IP)"
  value       = aws_instance.mongodb.private_ip
}

output "mongodb_connection_string" {
  description = "MongoDB connection string"
  value       = "mongodb://${aws_instance.mongodb.private_ip}:27017/${var.db_name}"
  sensitive   = false
}
