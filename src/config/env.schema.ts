import Joi from 'joi';
import { NodeEnv } from './app';

export const EnvSchema = Joi.object({
	NODE_ENV: Joi.string().required().valid(NodeEnv.DEV, NodeEnv.PROD, NodeEnv.TEST),
	PORT: Joi.number().required().port(),
});
