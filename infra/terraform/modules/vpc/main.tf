# Usar VPC default existente (AWS Academy no permite CreateVpc)
# No creamos VPC, subnets, IGW, NAT Gateway - usamos los que ya existen
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_internet_gateway" "default" {
  filter {
    name   = "attachment.vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

locals {
  vpc_id = data.aws_vpc.default.id
}

output "vpc_id" {
  value = local.vpc_id
}

output "public_subnets" {
  # Usar todas las subnets default (normalmente son públicas)
  value = data.aws_subnets.default.ids
}

output "private_subnets" {
  # Para simplificar, usar las mismas subnets (default VPC normalmente tiene subnets públicas)
  value = data.aws_subnets.default.ids
}

output "public_subnet_id" {
  # Usar la primera subnet default
  value = data.aws_subnets.default.ids[0]
}
