# Usar VPC default existente (AWS Academy no permite CreateVpc)
# No creamos VPC nueva, usamos la default que ya existe
data "aws_vpc" "default" {
  default = true
}

data "aws_internet_gateway" "default" {
  filter {
    name   = "attachment.vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Zonas de disponibilidad hardcodeadas para evitar permisos ec2:DescribeAvailabilityZones (AWS Academy restrictions)
locals {
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1e", "us-east-1f"]
  vpc_id              = data.aws_vpc.default.id
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = local.vpc_id
  cidr_block              = cidrsubnet(var.cidr_block, 4, count.index)
  availability_zone       = element(local.availability_zones, count.index)
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.environment}-public-subnet-${count.index}"
  }
}

resource "aws_subnet" "private" {
  count                   = 2
  vpc_id                  = local.vpc_id
  cidr_block              = cidrsubnet(var.cidr_block, 4, count.index + 2)
  availability_zone       = element(local.availability_zones, count.index)
  map_public_ip_on_launch = false
  tags = {
    Name = "${var.environment}-private-subnet-${count.index}"
  }
}

resource "aws_internet_gateway" "main" {
  count  = var.use_existing_vpc ? 0 : 1
  vpc_id = local.vpc_id
  tags = {
    Name = "${var.environment}-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = local.vpc_id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = var.use_existing_vpc ? data.aws_internet_gateway.existing[0].id : aws_internet_gateway.main[0].id
  }
  tags = {
    Name = "${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? (var.nat_gateway_per_az ? length(aws_subnet.public) : 1) : 0
  domain = "vpc"
  tags = {
    Name = "${var.environment}-nat-eip-${count.index}"
  }
}

resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? (var.nat_gateway_per_az ? length(aws_subnet.public) : 1) : 0
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[var.nat_gateway_per_az ? count.index : 0].id

  tags = {
    Name = "${var.environment}-nat-${count.index}"
  }

  # Terraform no permite depends_on condicional
  # La dependencia implícita a través del subnet es suficiente
}

resource "aws_route_table" "private" {
  count  = var.enable_nat_gateway ? (var.nat_gateway_per_az ? length(aws_subnet.private) : 1) : 0
  vpc_id = local.vpc_id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[var.nat_gateway_per_az ? count.index : 0].id
  }

  tags = {
    Name = "${var.environment}-private-rt-${count.index}"
  }
}

resource "aws_route_table_association" "private" {
  count          = var.enable_nat_gateway ? length(aws_subnet.private) : 0
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[var.nat_gateway_per_az ? count.index : 0].id
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
  # Si necesitas privadas, puedes crear NAT Gateway después manualmente
  value = data.aws_subnets.default.ids
}

output "public_subnet_id" {
  # Usar la primera subnet default
  value = data.aws_subnets.default.ids[0]
}
