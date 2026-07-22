import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordRequest {
	@ApiProperty({ minLength: 8, maxLength: 100, example: 'OldPass123!', description: 'Current user password' })
	@IsString({ message: 'currentPassword must be a string' })
	@MinLength(8, { message: 'currentPassword must be at least 8 characters long' })
	@MaxLength(100, { message: 'currentPassword must be at most 100 characters long' })
	currentPassword!: string;

	@ApiProperty({ minLength: 8, maxLength: 100, example: 'NewStr0ng!Pass', description: 'New password to set' })
	@IsString({ message: 'newPassword must be a string' })
	@MinLength(8, { message: 'newPassword must be at least 8 characters long' })
	@MaxLength(100, { message: 'newPassword must be at most 100 characters long' })
	newPassword!: string;
}
