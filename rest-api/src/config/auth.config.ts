import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  jwtAccessSecret: z.string().min(32),
  jwtAccessExpiration: z.string().default('15m'),
  jwtRefreshSecret: z.string().min(32),
  jwtRefreshExpiration: z.string().default('7d'),
  bcryptRounds: z.coerce.number().default(10),
  google: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    callbackUrl: z.string().optional(),
  }),
  github: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    callbackUrl: z.string().optional(),
  }),
});

export default registerAs('auth', () => {
  const config = schema.parse({
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
    bcryptRounds: process.env.BCRYPT_ROUNDS,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.GITHUB_CALLBACK_URL,
    },
  });
  return config;
});
