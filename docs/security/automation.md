# Automation Service Security

## Controls
- Validate input payloads and enforce size limits.
- Do not publish sensitive data to MQTT or RabbitMQ.
- Authentication enforced at API Gateway.

## Secrets
- `MQTT_URL` for broker connection.
- `RABBITMQ_URL` for queue connection.
