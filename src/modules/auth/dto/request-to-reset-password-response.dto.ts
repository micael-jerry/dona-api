import { ApiProperty } from '@nestjs/swagger';

export class RequestToResetPasswordResponse {
	@ApiProperty({ example: 'dona@dona.app', description: 'User email address' })
	email!: string;
}
