import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class LoginRequest {
	@ApiProperty()
	@IsEmail({}, { message: 'Invalid email address' })
	email!: string;

	@ApiProperty()
	@MinLength(8, { message: 'Password must be at least 8 characters long' })
	@MaxLength(100, { message: 'Password must be at most 100 characters long' })
	password!: string;
}
