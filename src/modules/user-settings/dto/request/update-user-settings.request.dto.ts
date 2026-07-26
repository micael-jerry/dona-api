import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Language, Theme } from '../../../../../prisma/generated/enums';

export class UpdateUserSettingsRequest {
	@ApiPropertyOptional({
		enum: Theme,
		enumName: 'Theme',
		example: Theme.DARK,
		description: 'User interface theme mode (LIGHT, DARK, SYSTEM)',
	})
	@IsOptional()
	@IsEnum(Theme, { message: 'theme must be a valid Theme enum value (LIGHT, DARK, SYSTEM)' })
	theme?: Theme;

	@ApiPropertyOptional({
		enum: Language,
		enumName: 'Language',
		example: Language.FR,
		description: 'Preferred application language (FR, EN, ES)',
	})
	@IsOptional()
	@IsEnum(Language, { message: 'language must be a valid Language enum value (FR, EN, ES)' })
	language?: Language;
}
