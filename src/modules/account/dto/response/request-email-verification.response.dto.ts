import { ApiProperty } from '@nestjs/swagger';

export class RequestEmailVerificationResponse {
	@ApiProperty({ example: 'Verification email sent successfully', description: 'Confirmation message' })
	message!: string;

	@ApiProperty({ example: 'user@example.com', description: 'Email address to which the verification link was sent' })
	email!: string;
}
