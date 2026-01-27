# Módulo Redis - Usando EC2 (más barato que ElastiCache para AWS Academy)
# Alternativa: ElastiCache (servicio administrado, más caro pero más robusto)

# Security Group para Redis
resource "aws_security_group" "redis" {
  name        = "${var.environment}-redis-sg"
  description = "Allow access to Redis from ASG instances"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.asg_security_group_id]
    description     = "Redis from ASG"
  }

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = var.bastion_sg_id != "" ? [var.bastion_sg_id] : []
    description     = "SSH from Bastion"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-redis-sg"
  }
}

# EC2 Instance para Redis
resource "aws_instance" "redis" {
  ami                         = local.amazon_linux_2_ami
  instance_type               = var.instance_type
  subnet_id                   = var.private_subnets[0]  # Primera subnet privada
  vpc_security_group_ids      = [aws_security_group.redis.id]
  associate_public_ip_address = false

  user_data_base64 = base64encode(file("${path.module}/user_data_redis.sh"))

  tags = {
    Name        = "${var.environment}-redis"
    Service     = "cache"
    Environment = var.environment
  }
}

# AMI ID hardcodeado para AWS Academy (no tiene permisos para SSM GetParameter)
locals {
  amazon_linux_2_ami = var.ami_id != "" ? var.ami_id : "ami-0c55b159cbfafe1f0"
}

output "redis_endpoint" {
  description = "Redis endpoint (private IP)"
  value       = aws_instance.redis.private_ip
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = "redis://${aws_instance.redis.private_ip}:6379"
  sensitive   = false
}
