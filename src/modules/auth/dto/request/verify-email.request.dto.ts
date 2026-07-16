import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailRequest {
	@ApiProperty({ description: 'User email verification token', example: 'token' })
	@IsNotEmpty()
	@IsString()
	emailVerificationToken!: string;
}
