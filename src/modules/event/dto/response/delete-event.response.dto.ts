import { ApiProperty } from '@nestjs/swagger';

export class DeleteEventResponse {
	@ApiProperty({
		description: 'Confirmation message of the deletion',
		example: 'Event deleted successfully.',
	})
	message!: string;
}
