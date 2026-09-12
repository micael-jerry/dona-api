import Joi from 'joi';
import { NodeEnv } from './app';

export const envSchema = Joi.object({
	NODE_ENV: Joi.string().required().valid(NodeEnv.DEV, NodeEnv.PROD, NodeEnv.TEST),
	PORT: Joi.number().required().port(),
	UI_URL: Joi.string().required(),
	// DATABASE
	DATABASE_URL: Joi.string().required(),
	// JWT
	JWT_SECRET_KEY: Joi.string().required(),
	JWT_EXPIRES_IN: Joi.string().required(),
	// AUTH GOOGLE
	GOOGLE_CLIENT_ID: Joi.string().required(),
	GOOGLE_CLIENT_SECRET: Joi.string().required(),
	GOOGLE_REDIRECT_URI: Joi.string().uri().required(),
	// S3 BUCKET
	SUPABASE_S3_BUCKET_NAME: Joi.string().required(),
	SUPABASE_S3_REGION: Joi.string().required(),
	SUPABASE_S3_ACCESS_KEY_ID: Joi.string().required(),
	SUPABASE_S3_SECRET_ACCESS_KEY: Joi.string().required(),
	SUPABASE_S3_ENDPOINT: Joi.string().uri().required(),
	// SMTP
	SMTP_HOST: Joi.string().required(),
	SMTP_PORT: Joi.number().required(),
	SMTP_AUTH_USER: Joi.string().required(),
	SMTP_AUTH_PASS: Joi.string().required(),
});
