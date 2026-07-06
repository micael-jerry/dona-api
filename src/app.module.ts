import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config/app';
import { EnvSchema } from './config/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
      load: [AppConfig],
      validationSchema: EnvSchema,
    }),
    HealthModule,
  ],
})
export class AppModule {}
