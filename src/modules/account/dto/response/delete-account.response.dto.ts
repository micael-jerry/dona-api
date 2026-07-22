import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountResponse {
	@ApiProperty({ example: 'Account successfully deleted', description: 'Confirmation message' })
	message!: string;
}
