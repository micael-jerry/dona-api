import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeleteAccountRequest {
	@ApiPropertyOptional({
		description: 'Current password for confirmation (required for password-based accounts)',
		example: 'Str0ng!Pass',
	})
	@IsOptional()
	@IsString({ message: 'password must be a string' })
	password?: string;
}
