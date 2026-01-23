resource "aws_launch_template" "main" {
  name_prefix            = "${var.environment}-lt-"
  image_id               = var.ami_id != "" ? var.ami_id : "ami-0c55b159cbfafe1f0" # Amazon Linux 2 us-east-1
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.asg.id]

  user_data = var.deploy_services ? base64encode(templatefile("${path.module}/user_data_services.sh.tftpl", {
    DOCKERHUB_USERNAME = var.dockerhub_username
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
  vpc_zone_identifier = var.private_subnets
  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }
  min_size                  = var.min_size
  max_size                  = var.max_size
  desired_capacity          = var.desired_capacity
  target_group_arns         = [var.elb_target_group_arn]
  health_check_type         = "ELB"
  health_check_grace_period = 300

  tag {
    key                 = "Name"
    value               = "${var.environment}-asg"
    propagate_at_launch = true
  }
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
}

# AMI hardcodeado para evitar permisos ec2:DescribeImages (AWS Academy restrictions)
# Amazon Linux 2 AMI ID para us-east-1 (actualizado: 2024)
# Si necesitas actualizar: buscar en AWS Console > EC2 > Launch Instance > Amazon Linux 2
variable "ami_id" {
  description = "AMI ID for Amazon Linux 2 (hardcoded to avoid DescribeImages permission)"
  type        = string
  default     = "ami-0c55b159cbfafe1f0" # Amazon Linux 2 AMI us-east-1 (puede necesitar actualizarse)
}

output "asg_name" {
  value = aws_autoscaling_group.main.name
}
