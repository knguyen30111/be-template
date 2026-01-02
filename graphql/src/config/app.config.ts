import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(3000),
  apiPrefix: z.string().default('api'),
  corsOrigin: z.string().default('*'),
  throttleTtl: z.coerce.number().default(60000),
  throttleLimit: z.coerce.number().default(100),
});

export default registerAs('app', () => {
  const config = schema.parse({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    apiPrefix: process.env.API_PREFIX,
    corsOrigin: process.env.CORS_ORIGIN,
    throttleTtl: process.env.THROTTLE_TTL,
    throttleLimit: process.env.THROTTLE_LIMIT,
  });
  return config;
});
