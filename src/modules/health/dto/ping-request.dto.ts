import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class PingRequest {
	@ApiProperty({
		description: 'The message to be sent in the ping request',
		example: 'ping',
		minLength: 4,
		maxLength: 10,
		required: false,
	})
	@IsOptional()
	@IsString()
	@MinLength(4)
	@MaxLength(10)
	message?: string = 'pong';
}
