output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "bastion_public_ip" {
  description = "Public IP of Bastion host"
  value       = module.bastion.public_ip
}

output "bastion_instance_id" {
  description = "Instance ID of the Bastion host (para usar con EC2 Instance Connect - SIN KEYS)"
  value       = module.bastion.instance_id
}

output "elb_dns_name" {
  description = "DNS name of the ELB"
  value       = module.elb.dns_name
}

output "api_gateway_url" {
  description = "API Gateway endpoint (ALB DNS - api-gateway microservicio es el punto de entrada)"
  value       = "http://${module.elb.dns_name}"
}

output "api_gateway_https_url" {
  description = "API Gateway HTTPS endpoint (si se configura certificado SSL en el futuro)"
  value       = "https://${module.elb.dns_name}"
}

output "asg_name" {
  description = "Name of the Auto Scaling Group"
  value       = module.asg.asg_name
}
