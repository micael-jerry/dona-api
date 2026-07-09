import { Body, Controller, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignupRequest } from './dto/signup-request.dto';
import { UserResponse } from '../user/dto/user-response.dto';
import { ApiCommonHttpErrorDecorator } from '../../common/decorators/api-common-http-error.decorator';
import { UserMapper } from '../user/user.mapper';
import { User } from '../../../prisma/generated/client';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({
		summary: 'User registration endpoint',
		description: 'Allows a new user to register by providing their details.',
	})
	@ApiBody({ type: SignupRequest })
	@ApiResponse({ status: HttpStatus.CREATED, type: UserResponse, description: 'User successfully registered' })
	@ApiCommonHttpErrorDecorator()
	async signUp(@Body() signupRequest: SignupRequest): Promise<UserResponse> {
		const createdUser: User = await this.authService.signup(signupRequest);
		return UserMapper.toDto(createdUser);
	}
}
