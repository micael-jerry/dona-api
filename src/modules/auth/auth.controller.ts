import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponse } from '../user/dto/user-response.dto';
import { ApiCommonHttpErrorDecorator } from '../../common/decorators/api-common-http-error.decorator';
import { UserMapper } from '../user/user.mapper';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserPayload } from './payload/user.payload';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './types/auth.type';
import {
	SignupRequest,
	LoginRequest,
	VerifyEmailRequest,
	ResetPasswordRequestRequest,
	ResetPasswordRequest,
} from './dto/request';
import { LoginResponse, ResetPasswordRequestResponse } from './dto/response';
import { LoginLocalGuard } from './guards/login-local.guard';

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
		return UserMapper.toDto(await this.authService.signup(signupRequest));
	}

	@ApiOperation({
		summary: 'User login endpoint',
		description: 'Allows a registered user to log in by providing their credentials.',
	})
	@ApiBody({ type: LoginRequest })
	@ApiResponse({ status: HttpStatus.OK, type: LoginResponse, description: 'User successfully logged in' })
	@ApiCommonHttpErrorDecorator()
	@Post('login')
	@UseGuards(LoginLocalGuard)
	async login(@CurrentUser() currentUser: UserPayload): Promise<LoginResponse> {
		const { token, user } = await this.authService.login(currentUser);
		return { token, user: UserMapper.toDto(user) };
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
	@ApiBody({ type: VerifyEmailRequest })
	@ApiResponse({ status: HttpStatus.OK, type: UserResponse, description: 'User email successfully verified' })
	@ApiCommonHttpErrorDecorator()
	@Post('verify-email')
	async verifyEmail(@Body() verifyEmailRequest: VerifyEmailRequest): Promise<UserResponse> {
		return await this.authService.verifyEmail(verifyEmailRequest.emailVerificationToken);
	}

	@ApiOperation({
		summary: 'Request to reset password endpoint',
		description: 'Allows a registered user to request to reset their password.',
	})
	@ApiBody({ type: ResetPasswordRequestRequest })
	@ApiResponse({
		status: HttpStatus.OK,
		type: ResetPasswordRequestResponse,
		description: 'Password reset email sent — returns the email address',
	})
	@ApiCommonHttpErrorDecorator()
	@Post('reset-password-request')
	async resetPasswordRequest(
		@Body() resetPasswordRequest: ResetPasswordRequestRequest,
	): Promise<ResetPasswordRequestResponse> {
		return await this.authService.resetPasswordRequest(resetPasswordRequest);
	}

	@ApiOperation({
		summary: 'Reset password endpoint',
		description:
			'Allows a user to set a new password by providing the reset token received by email and their new password.',
	})
	@ApiBody({ type: ResetPasswordRequest })
	@ApiResponse({
		status: HttpStatus.OK,
		type: UserResponse,
		description: 'Password successfully reset — returns the updated user',
	})
	@ApiCommonHttpErrorDecorator()
	@Post('reset-password')
	async resetPassword(@Body() resetPasswordRequest: ResetPasswordRequest): Promise<UserResponse> {
		const user = await this.authService.resetPassword(resetPasswordRequest);
		return UserMapper.toDto(user);
	}
}
