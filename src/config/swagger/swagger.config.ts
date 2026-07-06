import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
	title: 'Dona API',
	description: 'Dona API documentation',
	version: '1.0.0',
}));
