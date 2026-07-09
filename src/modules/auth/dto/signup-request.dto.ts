import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class SignupRequest {
	@ApiProperty()
	@IsEmail()
	email!: string;

	@ApiProperty({ minLength: 5, maxLength: 25 })
	@MinLength(5)
	@MaxLength(25)
	pseudo!: string;

	@ApiProperty({ minLength: 3, maxLength: 100 })
	@MinLength(3)
	@MaxLength(100)
	name!: string;

	@ApiProperty({ minLength: 8, maxLength: 100 })
	@MinLength(8)
	@MaxLength(100)
	password!: string;

	@ApiProperty({ description: 'Optional avatar URL for the user' })
	avatar?: string;
}
