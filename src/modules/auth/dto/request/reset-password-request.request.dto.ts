import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ResetPasswordRequestRequest {
	@ApiProperty({ example: 'dona@dona.app', description: 'User email address' })
	@IsEmail()
	@IsString()
	email!: string;
}
