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
  }
}

module "vpc" {
  source             = "../modules/vpc"
  environment        = var.environment
  cidr_block         = var.vpc_cidr
  enable_nat_gateway = var.enable_nat_gateway
  nat_gateway_per_az = var.nat_gateway_per_az
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
  elb_dns_name         = module.elb.dns_name
  environment          = var.environment
  deploy_services      = true
  dockerhub_username   = var.dockerhub_username
  image_tag            = var.image_tag
}

# AWS API Gateway removido - usando api-gateway microservicio como punto de entrada
# El ALB expone directamente el DNS público
# module "apigw" {
#   source       = "../modules/apigateway_http"
#   environment  = var.environment
#   alb_dns_name = module.elb.dns_name
# }
