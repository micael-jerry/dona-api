import { Injectable } from '@nestjs/common';
import { UserSettings } from '../../../prisma/generated/client';
import { UpdateUserSettingsRequest } from './dto/request/update-user-settings.request.dto';
import { UserSettingsRepository } from './user-settings.repository';

@Injectable()
export class UserSettingsService {
	constructor(private readonly userSettingsRepository: UserSettingsRepository) {}

	/**
	 * Retrieves settings for a given user. Automatically creates defaults if none exist.
	 *
	 * @param {string} userId - User ID.
	 * @returns {Promise<UserSettings>} The user settings entity.
	 */
	async getUserSettings(userId: string): Promise<UserSettings> {
		return this.userSettingsRepository.findOrCreateByUserId(userId);
	}

	/**
	 * Updates settings for a given user (theme, language).
	 *
	 * @param {string} userId - User ID.
	 * @param {UpdateUserSettingsRequest} updateDto - Settings to update.
	 * @returns {Promise<UserSettings>} The updated user settings entity.
	 */
	async updateUserSettings(userId: string, updateDto: UpdateUserSettingsRequest): Promise<UserSettings> {
		return this.userSettingsRepository.updateByUserId(userId, updateDto);
	}
}
