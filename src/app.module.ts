import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app';
import { envSchema } from './config/env.schema';
import { swaggerConfig } from './config/swagger';
import { HealthModule } from './modules/health/health.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
			isGlobal: true,
			cache: true,
			load: [appConfig, swaggerConfig],
			validationSchema: envSchema,
		}),
		HealthModule,
	],
})
export class AppModule {}
