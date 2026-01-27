# Obtener AMI ID automáticamente desde SSM Parameter Store
# AWS mantiene este parámetro actualizado con el AMI más reciente de Amazon Linux 2
# Esto evita necesitar permisos de DescribeImages y funciona automáticamente en CI/CD
data "aws_ssm_parameter" "amazon_linux_2" {
  name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}

resource "aws_security_group" "asg" {
  name        = "${var.environment}-asg-sg"
  description = "Allow traffic from ELB"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = var.instance_port
    to_port         = var.instance_port
    protocol        = "tcp"
    security_groups = [var.elb_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-asg-sg"
  }
}

resource "aws_launch_template" "main" {
  name_prefix            = "${var.environment}-lt-"
  image_id               = var.ami_id != "" ? var.ami_id : data.aws_ssm_parameter.amazon_linux_2.value
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.asg.id]

  user_data = var.deploy_services ? base64encode(templatefile("${path.module}/user_data_services.sh.tftpl", {
    DOCKERHUB_USERNAME = var.dockerhub_username
    DOCKERHUB_TOKEN    = var.dockerhub_token
    IMAGE_TAG          = var.image_tag
    ENVIRONMENT        = var.environment
    ELB_DNS_NAME       = var.elb_dns_name
  })) : (var.enable_default_user_data ? base64encode(templatefile("${path.module}/user_data.sh.tftpl", {})) : null)

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.environment}-asg-instance"
    }
  }
}

resource "aws_autoscaling_group" "main" {
  name                = "${var.environment}-asg"
  vpc_zone_identifier = var.private_subnets  # Usa múltiples subnets (2 AZs) para alta disponibilidad
  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }
  min_size                  = var.min_size
  max_size                  = var.max_size
  desired_capacity          = var.desired_capacity
  target_group_arns         = [var.elb_target_group_arn]
  health_check_type         = "ELB"
  health_check_grace_period = 600  # 10 minutos para dar tiempo a que Docker, servicios y nginx inicien completamente

  tag {
    key                 = "Name"
    value               = "${var.environment}-asg"
    propagate_at_launch = true
  }
}


output "asg_name" {
  value = aws_autoscaling_group.main.name
}

output "security_group_id" {
  description = "Security Group ID of ASG (para permitir acceso desde RDS, MongoDB, Redis)"
  value       = aws_security_group.asg.id
}
