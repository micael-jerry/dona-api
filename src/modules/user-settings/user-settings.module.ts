import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsRepository } from './user-settings.repository';
import { UserSettingsService } from './user-settings.service';

@Module({
	imports: [DbModule],
	controllers: [UserSettingsController],
	providers: [UserSettingsRepository, UserSettingsService],
	exports: [UserSettingsService, UserSettingsRepository],
})
export class UserSettingsModule {}
