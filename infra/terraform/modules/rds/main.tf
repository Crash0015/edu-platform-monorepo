# Módulo RDS para Postgres
# Crea instancias RDS separadas para cada servicio que usa Postgres

# Security Group para RDS
resource "aws_security_group" "rds" {
  name        = "${var.environment}-rds-sg"
  description = "Allow access to RDS from ASG instances"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.asg_security_group_id]
    description     = "Postgres from ASG"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-rds-sg"
  }
}

# Subnet Group para RDS (en subnets privadas para alta disponibilidad)
# Usa un nombre único para evitar conflictos con deployments anteriores
resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-rds-subnet-group-${substr(md5(join(",", var.private_subnets)), 0, 8)}"
  subnet_ids = var.private_subnets

  tags = {
    Name = "${var.environment}-rds-subnet-group"
  }
}

# RDS para Auth Service
resource "aws_db_instance" "auth" {
  identifier             = "${var.environment}-auth-db"
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true
  
  db_name  = "authdb"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"
  
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.environment}-auth-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Name        = "${var.environment}-auth-db"
    Service     = "auth-service"
    Environment = var.environment
  }
}

# RDS para Enrollment Service
resource "aws_db_instance" "enrollment" {
  identifier             = "${var.environment}-enrollment-db"
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true
  
  db_name  = "enrollmentdb"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"
  
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.environment}-enrollment-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Name        = "${var.environment}-enrollment-db"
    Service     = "enrollment-service"
    Environment = var.environment
  }
}

# RDS para Course Service
resource "aws_db_instance" "course" {
  identifier             = "${var.environment}-course-db"
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true
  
  db_name  = "coursedb"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"
  
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.environment}-course-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Name        = "${var.environment}-course-db"
    Service     = "course-service"
    Environment = var.environment
  }
}

# RDS para Schedule Service (si usa Postgres)
resource "aws_db_instance" "schedule" {
  count                  = var.create_schedule_db ? 1 : 0
  identifier             = "${var.environment}-schedule-db"
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true
  
  db_name  = "scheduledb"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"
  
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.environment}-schedule-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Name        = "${var.environment}-schedule-db"
    Service     = "schedule-service"
    Environment = var.environment
  }
}

# RDS para Tutoring Service (si usa Postgres)
resource "aws_db_instance" "tutoring" {
  count                  = var.create_tutoring_db ? 1 : 0
  identifier             = "${var.environment}-tutoring-db"
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true
  
  db_name  = "tutoringdb"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"
  
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.environment}-tutoring-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Name        = "${var.environment}-tutoring-db"
    Service     = "tutoring-service"
    Environment = var.environment
  }
}
