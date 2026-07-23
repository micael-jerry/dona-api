import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileRequest {
	@ApiPropertyOptional({ minLength: 3, maxLength: 100, example: 'John Doe', description: 'Updated full name' })
	@IsOptional()
	@IsString({ message: 'name must be a string' })
	@MinLength(3, { message: 'name must be at least 3 characters long' })
	@MaxLength(100, { message: 'name must be at most 100 characters long' })
	name?: string;

	@ApiPropertyOptional({ minLength: 5, maxLength: 25, example: 'john_doe', description: 'Updated unique pseudonym' })
	@IsOptional()
	@IsString({ message: 'pseudo must be a string' })
	@MinLength(5, { message: 'pseudo must be at least 5 characters long' })
	@MaxLength(25, { message: 'pseudo must be at most 25 characters long' })
	@Matches(/^[a-zA-Z0-9_]+$/, { message: 'pseudo must contain only alphanumeric characters and underscores' })
	pseudo?: string;

	@ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Updated email address' })
	@IsOptional()
	@IsEmail({}, { message: 'email must be a valid email address' })
	email?: string;

	@ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'Updated avatar URL' })
	@IsOptional()
	@IsUrl({}, { message: 'avatar must be a valid URL (e.g. https://example.com/avatar.png)' })
	avatar?: string;
}
