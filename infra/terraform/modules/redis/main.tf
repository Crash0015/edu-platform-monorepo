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
  ami                         = var.ami_id != "" ? var.ami_id : data.aws_ssm_parameter.amazon_linux_2.value
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

# Obtener AMI ID automáticamente
data "aws_ssm_parameter" "amazon_linux_2" {
  name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
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
