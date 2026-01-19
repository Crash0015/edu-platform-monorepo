import { defineConfig } from 'prisma/config';

const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://edu:edu@postgres-enrollment:5432/enrollmentdb';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: { url: databaseUrl },
  migrations: {
    path: './prisma/migrations',
  },
});

