import { UserSettings } from '../../../prisma/generated/client';
import { UserSettingsResponse } from './dto/response/user-settings.response.dto';

export class UserSettingsMapper {
	static toDto(entity: UserSettings): UserSettingsResponse {
		return {
			id: entity.id,
			userId: entity.userId,
			theme: entity.theme,
			language: entity.language,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		} satisfies UserSettingsResponse;
	}
}
