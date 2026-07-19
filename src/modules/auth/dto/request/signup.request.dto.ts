import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUrl, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class SignupRequest {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail({}, { message: 'email must be a valid email address (e.g. user@example.com)' })
	email!: string;

	@ApiProperty({ minLength: 5, maxLength: 25, example: 'john_doe' })
	@IsString({ message: 'pseudo must be a string' })
	@MinLength(5, { message: 'pseudo must be at least 5 characters long' })
	@MaxLength(25, { message: 'pseudo must be at most 25 characters long' })
	@Matches(/^[a-zA-Z0-9_]+$/, { message: 'pseudo must contain only alphanumeric characters and underscores' })
	pseudo!: string;

	@ApiProperty({ minLength: 3, maxLength: 100, example: 'John Doe' })
	@IsString({ message: 'name must be a string' })
	@MinLength(3, { message: 'name must be at least 3 characters long' })
	@MaxLength(100, { message: 'name must be at most 100 characters long' })
	name!: string;

	@ApiProperty({ minLength: 8, maxLength: 100, example: 'Str0ng!Pass' })
	@IsString({ message: 'password must be a string' })
	@MinLength(8, { message: 'password must be at least 8 characters long' })
	@MaxLength(100, { message: 'password must be at most 100 characters long' })
	password!: string;

	@ApiProperty({
		required: false,
		description: 'Optional avatar URL for the user',
		example: 'https://example.com/avatar.png',
	})
	@IsOptional()
	@IsUrl({}, { message: 'avatar must be a valid URL (e.g. https://example.com/avatar.png)' })
	avatar?: string;
}
