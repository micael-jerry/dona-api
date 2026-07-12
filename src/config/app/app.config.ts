import { registerAs } from '@nestjs/config';
import { NodeEnv } from './app-config.type';

export default registerAs('app', () => ({
	env: process.env.NODE_ENV as NodeEnv,
	port: Number.parseInt(process.env.PORT || '8080', 10),
	db: {
		url: process.env.DATABASE_URL,
	},
	jwt: {
		secretKey: process.env.JWT_SECRET_KEY,
		expiresIn: process.env.JWT_EXPIRES_IN,
	},
}));
