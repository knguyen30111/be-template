import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  url: z.string().url(),
  redisHost: z.string().default('localhost'),
  redisPort: z.coerce.number().default(6379),
  redisPassword: z.string().optional(),
});

export default registerAs('database', () => {
  const config = schema.parse({
    url: process.env.DATABASE_URL,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    redisPassword: process.env.REDIS_PASSWORD,
  });
  return config;
});
