import { ApiProperty } from '@nestjs/swagger';

export class HttpExceptionResponse {
	@ApiProperty({ description: 'HTTP status code' })
	status!: number;

	@ApiProperty({ description: 'Error type' })
	type!: string;

	@ApiProperty({
		type: String,
		isArray: true,
		description: 'Array of error messages',
	})
	message!: string[];

	@ApiProperty({ description: 'Timestamp of the error' })
	timestamp!: Date;

	@ApiProperty({ description: 'Request path that caused the error' })
	path!: string;
}
