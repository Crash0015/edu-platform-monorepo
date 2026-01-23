# Opcional: Crear EC2 Key Pair automáticamente
# Si var.create_key_pair = true, crea un key pair y guarda la clave privada
# Si var.key_name está definido, usa ese key pair existente

resource "tls_private_key" "bastion" {
  count     = var.create_key_pair && var.key_name == null ? 1 : 0
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "bastion" {
  count      = var.create_key_pair && var.key_name == null ? 1 : 0
  key_name   = "${var.environment}-bastion-key-${substr(md5("${var.environment}-bastion"), 0, 8)}"
  public_key = tls_private_key.bastion[0].public_key_openssh

  tags = {
    Name        = "${var.environment}-bastion-key"
    Environment = var.environment
  }
}

# Guardar la clave privada localmente (solo si se crea)
resource "local_file" "bastion_private_key" {
  count           = var.create_key_pair && var.key_name == null ? 1 : 0
  content         = tls_private_key.bastion[0].private_key_pem
  filename        = "${path.root}/${var.environment}-bastion-key.pem"
  file_permission = "0400"
}

output "key_pair_name" {
  description = "Nombre del key pair usado (creado o existente)"
  value       = var.key_name != null ? var.key_name : (var.create_key_pair ? aws_key_pair.bastion[0].key_name : null)
}

output "private_key_path" {
  description = "Ruta al archivo de clave privada (solo si se creó)"
  value       = var.create_key_pair && var.key_name == null ? "${path.root}/${var.environment}-bastion-key.pem" : null
}
