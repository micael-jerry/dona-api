import { ApiProperty } from '@nestjs/swagger';
import { Language, Theme } from '../../../../../prisma/generated/enums';

export class UserSettingsResponse {
	@ApiProperty({ description: 'Unique identifier of user settings', example: '123e4567-e89b-12d3-a456-426614174000' })
	id!: string;

	@ApiProperty({ description: 'ID of the associated user', example: '123e4567-e89b-12d3-a456-426614174000' })
	userId!: string;

	@ApiProperty({ description: 'User interface theme (LIGHT, DARK, SYSTEM)', enum: Theme, example: Theme.SYSTEM })
	theme!: Theme;

	@ApiProperty({ description: 'Preferred application language (FR, EN, ES)', enum: Language, example: Language.FR })
	language!: Language;

	@ApiProperty({ description: 'Timestamp when settings were created', example: '2026-07-26T00:00:00.000Z' })
	createdAt!: Date;

	@ApiProperty({ description: 'Timestamp when settings were last updated', example: '2026-07-26T00:00:00.000Z' })
	updatedAt!: Date;
}
