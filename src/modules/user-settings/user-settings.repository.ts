import { Injectable } from '@nestjs/common';
import { UserSettings } from '../../../prisma/generated/client';
import { UserSettingsUpdateInput } from '../../../prisma/generated/models';
import { DbService } from '../../db/db.service';

@Injectable()
export class UserSettingsRepository {
	constructor(private readonly dbService: DbService) {}

	/**
	 * Retrieves or creates default settings for a given user.
	 * If no settings record exists for the user, it is created automatically.
	 *
	 * @param {string} userId - ID of the user.
	 * @returns {Promise<UserSettings>} UserSettings entity.
	 */
	async findOrCreateByUserId(userId: string): Promise<UserSettings> {
		return this.dbService.userSettings.upsert({
			where: { userId },
			create: { userId },
			update: {},
		});
	}

	/**
	 * Updates user settings for a given user. If settings do not exist, they will be created with the provided data.
	 *
	 * @param {string} userId - ID of the user.
	 * @param {UserSettingsUpdateInput} data - Data to update.
	 * @returns {Promise<UserSettings>} Updated UserSettings entity.
	 */
	async updateByUserId(userId: string, data: UserSettingsUpdateInput): Promise<UserSettings> {
		return this.dbService.userSettings.upsert({
			where: { userId },
			create: {
				userId,
				...(data.theme && typeof data.theme === 'string' ? { theme: data.theme as any } : {}),
				...(data.language && typeof data.language === 'string' ? { language: data.language as any } : {}),
			},
			update: data,
		});
	}
}
