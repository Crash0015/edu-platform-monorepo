# ============================================
# ECS Fargate Services - QA Environment
# ============================================
# 
# Despliega los microservicios en ECS Fargate
# Requiere que las imágenes Docker estén en DockerHub
#
# Para desplegar:
# 1. Asegúrate de que dockerhub_username e image_tag estén en terraform.tfvars
# 2. terraform plan
# 3. terraform apply
# ============================================

# ============================================
# API Gateway (Puerto 3000)
# ============================================
module "api_gateway_tg" {
  source = "../modules/alb_target_group"

  environment   = var.environment
  service_name  = "api-gateway"
  vpc_id        = module.vpc.vpc_id
  listener_arn   = module.elb.listener_arn
  port          = 3000
  priority      = 100
  path_patterns = ["/*"]

  health_check_path = "/health"
}

module "api_gateway_ecs" {
  source = "../modules/ecs_fargate"

  environment          = var.environment
  service_name         = "api-gateway"
  vpc_id               = module.vpc.vpc_id
  private_subnets      = module.vpc.private_subnets
  alb_security_group_id = module.elb.security_group_id
  target_group_arn     = module.api_gateway_tg.target_group_arn

  docker_image   = "${var.dockerhub_username}/edu-api-gateway"
  image_tag      = var.image_tag
  container_port = 3000

  task_cpu     = 256
  task_memory   = 512
  desired_count = 1

  environment_variables = [
    {
      name  = "NODE_ENV"
      value = var.environment
    },
    {
      name  = "PORT"
      value = "3000"
    }
  ]

  health_check_command = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
}

# ============================================
# Auth Service (Puerto 3001)
# ============================================
module "auth_service_tg" {
  source = "../modules/alb_target_group"

  environment   = var.environment
  service_name  = "auth-service"
  vpc_id        = module.vpc.vpc_id
  listener_arn  = module.elb.listener_arn
  port          = 3001
  priority      = 200
  path_patterns = ["/api/v1/auth/*"]

  health_check_path = "/health"
}

module "auth_service_ecs" {
  source = "../modules/ecs_fargate"

  environment          = var.environment
  service_name         = "auth-service"
  vpc_id               = module.vpc.vpc_id
  private_subnets      = module.vpc.private_subnets
  alb_security_group_id = module.elb.security_group_id
  target_group_arn     = module.auth_service_tg.target_group_arn

  docker_image   = "${var.dockerhub_username}/edu-auth-service"
  image_tag      = var.image_tag
  container_port = 3001

  task_cpu     = 512
  task_memory   = 1024
  desired_count = 1

  environment_variables = [
    {
      name  = "NODE_ENV"
      value = var.environment
    },
    {
      name  = "PORT"
      value = "3001"
    }
  ]

  health_check_command = ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
}

# ============================================
# Course Service (Puerto 3004)
# ============================================
module "course_service_tg" {
  source = "../modules/alb_target_group"

  environment   = var.environment
  service_name  = "course-service"
  vpc_id        = module.vpc.vpc_id
  listener_arn  = module.elb.listener_arn
  port          = 3004
  priority      = 300
  path_patterns = ["/api/v1/courses/*"]

  health_check_path = "/health"
}

module "course_service_ecs" {
  source = "../modules/ecs_fargate"

  environment          = var.environment
  service_name         = "course-service"
  vpc_id               = module.vpc.vpc_id
  private_subnets      = module.vpc.private_subnets
  alb_security_group_id = module.elb.security_group_id
  target_group_arn     = module.course_service_tg.target_group_arn

  docker_image   = "${var.dockerhub_username}/edu-course-service"
  image_tag      = var.image_tag
  container_port = 3004

  task_cpu     = 512
  task_memory   = 1024
  desired_count = 1

  environment_variables = [
    {
      name  = "NODE_ENV"
      value = var.environment
    },
    {
      name  = "PORT"
      value = "3004"
    }
  ]

  health_check_command = ["CMD-SHELL", "curl -f http://localhost:3004/health || exit 1"]
}

# ============================================
# Enrollment Service (Puerto 3007)
# ============================================
module "enrollment_service_tg" {
  source = "../modules/alb_target_group"

  environment   = var.environment
  service_name  = "enrollment-service"
  vpc_id        = module.vpc.vpc_id
  listener_arn  = module.elb.listener_arn
  port          = 3007
  priority      = 400
  path_patterns = ["/api/v1/enrollments/*"]

  health_check_path = "/health"
}

module "enrollment_service_ecs" {
  source = "../modules/ecs_fargate"

  environment          = var.environment
  service_name         = "enrollment-service"
  vpc_id               = module.vpc.vpc_id
  private_subnets      = module.vpc.private_subnets
  alb_security_group_id = module.elb.security_group_id
  target_group_arn     = module.enrollment_service_tg.target_group_arn

  docker_image   = "${var.dockerhub_username}/edu-enrollment-service"
  image_tag      = var.image_tag
  container_port = 3007

  task_cpu     = 512
  task_memory   = 1024
  desired_count = 1

  environment_variables = [
    {
      name  = "NODE_ENV"
      value = var.environment
    },
    {
      name  = "PORT"
      value = "3007"
    }
  ]

  health_check_command = ["CMD-SHELL", "curl -f http://localhost:3007/health || exit 1"]
}

# ============================================
# NOTA: Puedes agregar más servicios siguiendo el mismo patrón
# - notification-service (puerto 3005)
# - automation-service
# - material-service
# - schedule-service
# - search-service
# - tutoring-service
# - user-service
# ============================================
