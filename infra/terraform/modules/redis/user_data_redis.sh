#!/bin/bash
set -euo pipefail

# Instalar Redis en EC2
yum update -y
amazon-linux-extras install epel -y
yum install -y redis

# Configurar Redis para escuchar en todas las interfaces (dentro de la VPC)
sed -i 's/^bind 127.0.0.1/bind 0.0.0.0/' /etc/redis.conf
sed -i 's/^protected-mode yes/protected-mode no/' /etc/redis.conf

# Iniciar Redis
systemctl enable redis
systemctl start redis

echo "Redis instalado y configurado"
