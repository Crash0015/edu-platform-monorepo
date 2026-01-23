output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "bastion_public_ip" {
  description = "Public IP of Bastion host"
  value       = module.bastion.public_ip
}

output "alb_dns_name" {
  description = "DNS name of the ALB"
  value       = module.elb.dns_name
}

output "api_gateway_url" {
  description = "API Gateway HTTP API endpoint (proxies to the ALB)"
  value       = module.apigw.api_endpoint
}

output "asg_name" {
  description = "Name of the Auto Scaling Group"
  value       = module.asg.asg_name
}
