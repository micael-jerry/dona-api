import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequestResponse {
	@ApiProperty({ example: 'dona@dona.app', description: 'User email address' })
	email!: string;
}
