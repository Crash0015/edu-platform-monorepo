terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = ">= 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = ">= 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.0"
    }
  }
}

module "vpc" {
  source               = "../modules/vpc"
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  enable_nat_gateway   = var.enable_nat_gateway
  nat_gateway_per_az   = var.nat_gateway_per_az
}

module "bastion" {
  source            = "../modules/bastion"
  vpc_id            = module.vpc.vpc_id
  subnet_id         = module.vpc.public_subnet_id
  environment       = var.environment
  key_name          = var.bastion_key_name
  create_key_pair   = false # DESHABILITADO - AWS Academy no permite ImportKeyPair
  allowed_ssh_cidrs = var.bastion_allowed_ssh_cidrs
}

module "elb" {
  source         = "../modules/elb"
  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets
  environment    = var.environment
}

module "asg" {
  source               = "../modules/asg"
  vpc_id               = module.vpc.vpc_id
  private_subnets      = module.vpc.private_subnets
  elb_target_group_arn = module.elb.target_group_arn
  elb_sg_id            = module.elb.security_group_id
  bastion_sg_id       = module.bastion.security_group_id
  elb_dns_name         = module.elb.dns_name
  environment          = var.environment
  deploy_services      = true
  dockerhub_username   = var.dockerhub_username
  dockerhub_token      = var.dockerhub_token
  image_tag            = var.image_tag
  
  # Configuración optimizada para AWS Academy con alta disponibilidad
  instance_type    = "t3.micro"  # Más barato que t3.small
  min_size         = 2           # Mínimo 2 instancias (una por AZ para HA)
  max_size         = 8           # Máximo 8 instancias (respetando límite de 10 total)
  desired_capacity = 2           # 2 instancias iniciales (distribuidas en 2 AZs)
  
  # Connection strings de bases de datos - inicialmente vacías
  # Se actualizarán después de que las bases de datos se creen
  # Los servicios usarán valores por defecto o se configurarán manualmente
  auth_db_url          = ""
  enrollment_db_url    = ""
  course_db_url        = ""
  schedule_db_url      = ""
  tutoring_db_url      = ""
  mongodb_url          = ""
  redis_url            = ""
}

# Bases de Datos - Instancias separadas para alta disponibilidad
# NOTA: Se crean después del ASG para evitar dependencias circulares
# El ASG se crea primero, luego las bases de datos usan el security_group_id del ASG
module "rds" {
  source                 = "../modules/rds"
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  private_subnets        = module.vpc.private_subnets
  asg_security_group_id  = module.asg.security_group_id
  instance_class         = var.rds_instance_class
  allocated_storage      = var.rds_allocated_storage
  db_username            = var.db_username
  db_password            = var.db_password
  backup_retention_period = var.rds_backup_retention_period
  skip_final_snapshot    = var.rds_skip_final_snapshot
  create_schedule_db     = true
  create_tutoring_db     = true
  
  depends_on = [module.asg]
}

module "mongodb" {
  source                = "../modules/mongodb"
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  private_subnets       = module.vpc.private_subnets
  asg_security_group_id = module.asg.security_group_id
  instance_type         = var.mongodb_instance_type
  db_name               = "search"
  
  depends_on = [module.asg]
}

module "redis" {
  source                = "../modules/redis"
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  private_subnets       = module.vpc.private_subnets
  asg_security_group_id = module.asg.security_group_id
  instance_type         = var.redis_instance_type
  
  depends_on = [module.asg]
}

# Nota: API Gateway microservicio eliminado - LB actúa como punto de entrada
# Nginx en cada instancia hace routing directo a servicios
# Las bases de datos están en instancias separadas (RDS para Postgres, EC2 para MongoDB y Redis)
