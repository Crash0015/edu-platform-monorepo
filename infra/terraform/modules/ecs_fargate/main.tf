resource "aws_ecs_cluster" "main" {
  name = "${var.environment}-cluster"
  tags = {
    Name        = "${var.environment}-ecs-cluster"
    Environment = var.environment
  }
}

resource "aws_ecs_task_definition" "service" {
  family                   = "${var.environment}-${var.service_name}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = local.ecs_execution_role_arn
  task_role_arn            = local.ecs_task_role_arn

  container_definitions = jsonencode([
    {
      name  = var.service_name
      image = "${var.docker_image}:${var.image_tag}"

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = var.environment_variables

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.service.name
          "awslogs-region"        = data.aws_region.current.id
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = var.health_check_command
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name        = "${var.environment}-${var.service_name}-task"
    Environment = var.environment
    Service     = var.service_name
  }
}

resource "aws_ecs_service" "main" {
  name            = "${var.environment}-${var.service_name}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnets
    security_groups  = [aws_security_group.ecs_service.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = var.service_name
    container_port   = var.container_port
  }

  depends_on = var.use_existing_iam_roles ? null : [
    aws_iam_role_policy_attachment.ecs_execution[0],
  ]

  tags = {
    Name        = "${var.environment}-${var.service_name}-service"
    Environment = var.environment
    Service     = var.service_name
  }
}

resource "aws_security_group" "ecs_service" {
  name        = "${var.environment}-${var.service_name}-sg"
  description = "Security group for ECS service ${var.service_name}"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups  = [var.alb_security_group_id]
    description     = "Allow traffic from ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.environment}-${var.service_name}-sg"
    Environment = var.environment
    Service     = var.service_name
  }
}

resource "aws_cloudwatch_log_group" "service" {
  name              = "/ecs/${var.environment}/${var.service_name}-${substr(md5("${var.environment}-${var.service_name}"), 0, 8)}"
  retention_in_days = var.log_retention_days
  tags = {
    Name        = "${var.environment}-${var.service_name}-logs"
    Environment = var.environment
    Service     = var.service_name
  }
}

# IAM Role for ECS Task Execution (pulling images, writing logs)
# Usar data source para obtener roles IAM existentes si están disponibles
# Si no existen, intentar crearlos (fallará en AWS Academy pero no romperá el plan)
data "aws_iam_role" "ecs_execution_existing" {
  count = var.use_existing_iam_roles ? 1 : 0
  name  = var.existing_execution_role_name != "" ? var.existing_execution_role_name : "ecsTaskExecutionRole"
}

data "aws_iam_role" "ecs_task_existing" {
  count = var.use_existing_iam_roles ? 1 : 0
  name  = var.existing_task_role_name != "" ? var.existing_task_role_name : "ecsTaskRole"
}

resource "aws_iam_role" "ecs_execution" {
  count = var.use_existing_iam_roles ? 0 : 1
  name  = "${var.environment}-${var.service_name}-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.environment}-${var.service_name}-execution-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  count      = var.use_existing_iam_roles ? 0 : 1
  role       = aws_iam_role.ecs_execution[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role for ECS Task (application permissions)
resource "aws_iam_role" "ecs_task" {
  count = var.use_existing_iam_roles ? 0 : 1
  name  = "${var.environment}-${var.service_name}-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.environment}-${var.service_name}-task-role"
    Environment = var.environment
  }
}

# Local values para usar el rol existente o el creado
locals {
  ecs_execution_role_arn = var.use_existing_iam_roles ? data.aws_iam_role.ecs_execution_existing[0].arn : aws_iam_role.ecs_execution[0].arn
  ecs_task_role_arn      = var.use_existing_iam_roles ? data.aws_iam_role.ecs_task_existing[0].arn : aws_iam_role.ecs_task[0].arn
}

data "aws_region" "current" {}

output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "service_name" {
  value = aws_ecs_service.main.name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.service.arn
}
