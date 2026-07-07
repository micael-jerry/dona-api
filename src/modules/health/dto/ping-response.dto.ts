import { ApiProperty } from '@nestjs/swagger';

export class PingResponse {
	@ApiProperty({
		description: 'The message returned in the ping response',
		example: 'pong',
	})
	message!: string;
}
