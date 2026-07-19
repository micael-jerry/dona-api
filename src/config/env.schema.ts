import Joi from 'joi';
import { NodeEnv } from './app';

export const envSchema = Joi.object({
	NODE_ENV: Joi.string().required().valid(NodeEnv.DEV, NodeEnv.PROD, NodeEnv.TEST),
	PORT: Joi.number().required().port(),
	DATABASE_URL: Joi.string().required(),
	JWT_SECRET_KEY: Joi.string().required(),
	JWT_EXPIRES_IN: Joi.string().required(),
	RESEND_API_KEY: Joi.string().required(),
	UI_URL: Joi.string().required(),
	GOOGLE_CLIENT_ID: Joi.string().required(),
	GOOGLE_CLIENT_SECRET: Joi.string().required(),
	GOOGLE_REDIRECT_URI: Joi.string().uri().required(),
});
