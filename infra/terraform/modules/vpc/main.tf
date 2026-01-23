# Opción para usar VPC existente (si AWS Academy no permite crear VPCs)
variable "use_existing_vpc" {
  description = "Si true, usa una VPC existente en lugar de crear una nueva"
  type        = bool
  default     = false
}

variable "existing_vpc_id" {
  description = "ID de VPC existente (requerido si use_existing_vpc=true)"
  type        = string
  default     = ""
}

data "aws_vpc" "existing" {
  count = var.use_existing_vpc ? 1 : 0
  id    = var.existing_vpc_id
}

resource "aws_vpc" "main" {
  count                = var.use_existing_vpc ? 0 : 1
  cidr_block           = var.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "${var.environment}-vpc"
  }
}

locals {
  vpc_id = var.use_existing_vpc ? data.aws_vpc.existing[0].id : aws_vpc.main[0].id
}

# Zonas de disponibilidad hardcodeadas para evitar permisos ec2:DescribeAvailabilityZones (AWS Academy restrictions)
# us-east-1 tiene múltiples AZs, usamos las más comunes
locals {
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1e", "us-east-1f"]
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
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
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${var.environment}-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
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

  depends_on = var.use_existing_vpc ? [] : [aws_internet_gateway.main[0]]
}

resource "aws_route_table" "private" {
  count  = var.enable_nat_gateway ? (var.nat_gateway_per_az ? length(aws_subnet.private) : 1) : 0
  vpc_id = aws_vpc.main.id

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
  value = aws_vpc.main.id
}

output "public_subnets" {
  value = aws_subnet.public[*].id
}

output "private_subnets" {
  value = aws_subnet.private[*].id
}

output "public_subnet_id" {
  value = aws_subnet.public[0].id
}
