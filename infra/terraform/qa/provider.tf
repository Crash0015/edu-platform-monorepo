provider "aws" {
  region = var.aws_region
  # Credenciales se toman automáticamente de variables de entorno:
  # AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
  # El provider de AWS las detecta automáticamente, no necesitamos especificarlas aquí
}
