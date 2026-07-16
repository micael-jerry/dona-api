import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignupRequest } from './dto/signup-request.dto';
import { UserResponse } from '../user/dto/user-response.dto';
import { ApiCommonHttpErrorDecorator } from '../../common/decorators/api-common-http-error.decorator';
import { UserMapper } from '../user/user.mapper';
import { User } from '../../../prisma/generated/client';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/login-request.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserPayload } from './payload/user.payload';
import { LoginResponse } from './dto/login-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './types/auth.type';
import { EmailVerificationRequest } from './dto/verification-email-request.dto';
import { RequestToResetPasswordResponse } from './dto/request-to-reset-password-response.dto';
import { RquestToResetPasswordRequest } from './dto/request-to-reset-password-request';

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
	@Post('signup')
	async signUp(@Body() signupRequest: SignupRequest): Promise<UserResponse> {
		const createdUser: User = await this.authService.signup(signupRequest);
		return UserMapper.toDto(createdUser);
	}

	@ApiOperation({
		summary: 'User login endpoint',
		description: 'Allows a registered user to log in by providing their credentials.',
	})
	@ApiBody({ type: LoginRequest })
	@ApiResponse({ status: HttpStatus.OK, type: LoginResponse, description: 'User successfully logged in' })
	@ApiCommonHttpErrorDecorator()
	@Post('login')
	@UseGuards(AuthGuard('local'))
	async login(@CurrentUser() currentUser: UserPayload): Promise<LoginResponse> {
		return await this.authService.login(currentUser);
	}

	@ApiOperation({
		summary: 'Get current user information',
		description: 'Returns the information of the currently authenticated user.',
	})
	@ApiResponse({ status: HttpStatus.OK, type: UserPayload, description: 'Current user information' })
	@ApiCommonHttpErrorDecorator()
	@Get('whoami')
	@Auth(AuthType.AUTHENTICATED)
	whoami(@CurrentUser() currentUser: UserPayload): UserPayload {
		return currentUser;
	}

	@ApiOperation({
		summary: 'Verify email endpoint',
		description: 'Allows a registered user to verify their email by providing their verification token.',
	})
	@ApiBody({ type: EmailVerificationRequest })
	@ApiResponse({ status: HttpStatus.OK, type: UserResponse, description: 'User email successfully verified' })
	@ApiCommonHttpErrorDecorator()
	@Post('verify-email')
	async verifyEmail(@Body() emailVerificationRequest: EmailVerificationRequest): Promise<UserResponse> {
		return await this.authService.verifyEmail(emailVerificationRequest.emailVerificationToken);
	}

	@ApiOperation({
		summary: 'Request to reset password endpoint',
		description: 'Allows a registered user to request to reset their password.',
	})
	@ApiBody({ type: RquestToResetPasswordRequest })
	@ApiResponse({
		status: HttpStatus.OK,
		type: RequestToResetPasswordResponse,
		description: 'User email successfully verified',
	})
	@ApiCommonHttpErrorDecorator()
	@Post('reset-password-request')
	async resetPasswordRequest(
		@Body() resetPasswordRequest: RquestToResetPasswordRequest,
	): Promise<RequestToResetPasswordResponse> {
		return await this.authService.resetPasswordRequest(resetPasswordRequest);
	}
}
