import { registerAs } from '@nestjs/config';
import { NodeEnv } from './app.type';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV as NodeEnv,
  port: Number.parseInt(process.env.PORT || '8080', 10),
}));
