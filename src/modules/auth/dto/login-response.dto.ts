import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../../user/dto/user-response.dto';

export class LoginResponse {
	@ApiProperty({ description: 'JWT Token for authentication' })
	token!: string;

	@ApiProperty({ type: UserResponse, description: 'User profile' })
	user!: UserResponse;
}
