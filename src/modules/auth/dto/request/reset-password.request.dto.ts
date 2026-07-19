import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordRequest {
	@ApiProperty({
		description: 'The password reset token received by email',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	@IsNotEmpty()
	@IsString()
	resetPasswordToken!: string;

	@ApiProperty({
		description: 'The new password to set for the account',
		minLength: 8,
		maxLength: 100,
		example: 'N3wStr0ng!Pass',
	})
	@IsString()
	@MinLength(8, { message: 'newPassword must be at least 8 characters long' })
	@MaxLength(100, { message: 'newPassword must be at most 100 characters long' })
	newPassword!: string;
}
