resource "aws_security_group" "bastion" {
  name        = "${var.environment}-bastion-sg"
  description = "Allow SSH access to bastion host"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-bastion-sg"
  }
}

resource "aws_instance" "bastion" {
  ami                         = var.ami_id != "" ? var.ami_id : "ami-0c55b159cbfafe1f0" # Amazon Linux 2 us-east-1
  instance_type               = "t3.micro"
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  associate_public_ip_address = true
  key_name                    = var.key_name != null ? var.key_name : (var.create_key_pair ? aws_key_pair.bastion[0].key_name : null)
  tags = {
    Name = "${var.environment}-bastion"
  }
}

output "public_ip" {
  value = aws_instance.bastion.public_ip
}
