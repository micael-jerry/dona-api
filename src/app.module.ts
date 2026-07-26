import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { appConfig } from './config/app';
import { envSchema } from './config/env.schema';
import { swaggerConfig } from './config/swagger';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { UserSettingsModule } from './modules/user-settings/user-settings.module';
import { DbModule } from './db/db.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
			isGlobal: true,
			cache: true,
			load: [appConfig, swaggerConfig],
			validationSchema: envSchema,
		}),
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.getOrThrow<string>('app.jwt.secretKey'),
				signOptions: {
					expiresIn: configService.getOrThrow('app.jwt.expiresIn'),
				},
			}),
		}),
		HealthModule,
		DbModule,
		AuthModule,
		AccountModule,
		UserSettingsModule,
	],
})
export class AppModule {}
