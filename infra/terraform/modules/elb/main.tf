resource "aws_security_group" "elb" {
  name        = "${var.environment}-elb-sg"
  description = "Allow HTTP/HTTPS access"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-elb-sg"
  }
}

resource "aws_lb" "main" {
  name               = "${var.environment}-elb-${substr(md5("${var.environment}-elb"), 0, 8)}"
  internal           = false
  load_balancer_type = "application"
  subnets            = var.public_subnets
  security_groups    = [aws_security_group.elb.id]
  tags = {
    Name = "${var.environment}-elb"
  }
}

resource "aws_lb_target_group" "main" {
  name     = "${var.environment}-tg-${substr(md5("${var.environment}-tg"), 0, 8)}"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  
  # Health check más tolerante para dar tiempo a que los servicios inicien
  # Configurado para ser muy tolerante durante el arranque inicial
  health_check {
    path                = var.health_check_path
    protocol            = "HTTP"
    port                = "traffic-port"
    matcher             = "200"  # Solo acepta 200 OK
    interval            = 60     # Check cada 60 segundos (más tiempo entre checks)
    timeout             = 15     # Timeout de 15 segundos (más tolerante)
    healthy_threshold   = 2      # Necesita 2 checks exitosos para marcar como healthy
    unhealthy_threshold = 5      # Necesita 5 checks fallidos para marcar como unhealthy (muy tolerante)
  }
  
  # Asegurar que el target group esté en múltiples AZs
  deregistration_delay = 30
  
  tags = {
    Name = "${var.environment}-tg"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

output "dns_name" {
  value = aws_lb.main.dns_name
}

output "target_group_arn" {
  value = aws_lb_target_group.main.arn
}

output "security_group_id" {
  value = aws_security_group.elb.id
}

output "listener_arn" {
  value = aws_lb_listener.http.arn
}
