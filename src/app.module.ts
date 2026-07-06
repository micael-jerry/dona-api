import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config/app';
import { envSchema } from './config/env.schema';
import { HealthModule } from './modules/health/health.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
			isGlobal: true,
			cache: true,
			load: [AppConfig],
			validationSchema: envSchema,
		}),
		HealthModule,
	],
})
export class AppModule {}
