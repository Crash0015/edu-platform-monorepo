output "auth_db_endpoint" {
  description = "RDS endpoint for auth service"
  value       = aws_db_instance.auth.endpoint
}

output "auth_db_connection_string" {
  description = "PostgreSQL connection string for auth service"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.auth.endpoint}/${aws_db_instance.auth.db_name}"
  sensitive   = true
}

output "enrollment_db_endpoint" {
  description = "RDS endpoint for enrollment service"
  value       = aws_db_instance.enrollment.endpoint
}

output "enrollment_db_connection_string" {
  description = "PostgreSQL connection string for enrollment service"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.enrollment.endpoint}/${aws_db_instance.enrollment.db_name}"
  sensitive   = true
}

output "course_db_endpoint" {
  description = "RDS endpoint for course service"
  value       = aws_db_instance.course.endpoint
}

output "course_db_connection_string" {
  description = "PostgreSQL connection string for course service"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.course.endpoint}/${aws_db_instance.course.db_name}"
  sensitive   = true
}

output "schedule_db_endpoint" {
  description = "RDS endpoint for schedule service"
  value       = var.create_schedule_db ? aws_db_instance.schedule[0].endpoint : null
}

output "schedule_db_connection_string" {
  description = "PostgreSQL connection string for schedule service"
  value       = var.create_schedule_db ? "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.schedule[0].endpoint}/${aws_db_instance.schedule[0].db_name}" : null
  sensitive   = true
}

output "tutoring_db_endpoint" {
  description = "RDS endpoint for tutoring service"
  value       = var.create_tutoring_db ? aws_db_instance.tutoring[0].endpoint : null
}

output "tutoring_db_connection_string" {
  description = "PostgreSQL connection string for tutoring service"
  value       = var.create_tutoring_db ? "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.tutoring[0].endpoint}/${aws_db_instance.tutoring[0].db_name}" : null
  sensitive   = true
}
