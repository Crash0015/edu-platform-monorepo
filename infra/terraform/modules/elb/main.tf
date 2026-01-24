# AWS Academy bloquea CreateSecurityGroup - usar Security Group existente o default
variable "security_group_id" {
  description = "Security Group ID existente para ELB (opcional - si no se proporciona, se intenta usar default)"
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
  elb_sg_id = var.security_group_id != "" ? var.security_group_id : (length(data.aws_security_group.default) > 0 ? data.aws_security_group.default[0].id : "")
}

resource "aws_lb" "main" {
  name               = "${var.environment}-elb-${substr(md5("${var.environment}-elb"), 0, 8)}"
  internal           = false
  load_balancer_type = "application"
  subnets            = var.public_subnets
  security_groups    = local.elb_sg_id != "" ? [local.elb_sg_id] : []
  tags = {
    Name = "${var.environment}-elb"
  }
}

resource "aws_lb_target_group" "main" {
  name     = "${var.environment}-tg-${substr(md5("${var.environment}-tg"), 0, 8)}"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  health_check {
    path                = var.health_check_path
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
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
