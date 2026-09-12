import { registerAs } from '@nestjs/config';
import { NodeEnv } from './app-config.type';

export default registerAs('app', () => ({
	env: process.env.NODE_ENV as NodeEnv,
	port: Number.parseInt(process.env.PORT || '8080', 10),
	uiUrl: process.env.UI_URL,
	db: {
		url: process.env.DATABASE_URL,
	},
	jwt: {
		secretKey: process.env.JWT_SECRET_KEY,
		expiresIn: process.env.JWT_EXPIRES_IN,
	},
	google: {
		clientId: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackUrl: process.env.GOOGLE_REDIRECT_URI,
	},
	bucketS3: {
		name: process.env.SUPABASE_S3_BUCKET_NAME,
		region: process.env.SUPABASE_S3_REGION,
		accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
		secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
		endpoint: process.env.SUPABASE_S3_ENDPOINT,
	},
	smtp: {
		host: process.env.SMTP_HOST,
		port: Number.parseInt(process.env.SMTP_PORT as string, 10),
		auth: {
			user: process.env.SMTP_AUTH_USER,
			pass: process.env.SMTP_AUTH_PASS,
		},
	},
}));
