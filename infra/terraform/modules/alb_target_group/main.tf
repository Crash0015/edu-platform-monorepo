resource "aws_lb_target_group" "service" {
  name        = "${var.environment}-${var.service_name}-tg"
  port        = var.port
  protocol    = var.protocol
  vpc_id      = var.vpc_id
  target_type = "ip" # For Fargate

  health_check {
    enabled             = true
    healthy_threshold   = var.healthy_threshold
    unhealthy_threshold = var.unhealthy_threshold
    timeout             = var.timeout
    interval            = var.interval
    path                = var.health_check_path
    protocol            = var.health_check_protocol
    matcher             = var.health_check_matcher
  }

  deregistration_delay = 30

  tags = {
    Name        = "${var.environment}-${var.service_name}-tg"
    Environment = var.environment
    Service     = var.service_name
  }
}

resource "aws_lb_listener_rule" "service" {
  listener_arn = var.listener_arn
  priority     = var.priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.service.arn
  }

  condition {
    path_pattern {
      values = var.path_patterns
    }
  }
}

output "target_group_arn" {
  value = aws_lb_target_group.service.arn
}

output "target_group_id" {
  value = aws_lb_target_group.service.id
}
