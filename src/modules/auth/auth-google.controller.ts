import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonHttpErrorDecorator } from '../../common/decorators/api-common-http-error.decorator';
import { LoginGoogleGuard } from './guards/login-google.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserPayload } from './payload/user.payload';
import { AuthUtil } from './auth.util';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@ApiTags('Auth Google')
@Controller('auth/google')
export class AuthGoogleController {
	private uiUrl: string;

	constructor(
		private readonly authUtil: AuthUtil,
		private readonly configService: ConfigService,
	) {
		this.uiUrl = this.configService.getOrThrow<string>('app.uiUrl');
	}

	@ApiOperation({
		summary: 'Initiate Google OAuth login',
		description: 'Redirects the user to the Google OAuth consent screen to begin the authentication flow.',
	})
	@ApiResponse({ status: HttpStatus.FOUND, description: 'Redirects to Google OAuth consent screen' })
	@ApiCommonHttpErrorDecorator()
	@Get('login')
	@UseGuards(LoginGoogleGuard)
	login() {
		return;
	}

	@ApiOperation({
		summary: 'Google OAuth callback',
		description:
			'Handles the redirect from Google after authentication. Generates a JWT token and redirects the user to the UI with the token as a query parameter.',
	})
	@ApiResponse({
		status: HttpStatus.FOUND,
		description: 'Redirects to the UI with the JWT token as a query parameter (?token=...)',
	})
	@ApiCommonHttpErrorDecorator()
	@Get('redirect')
	@UseGuards(LoginGoogleGuard)
	async redirect(@CurrentUser() currentUser: UserPayload, @Res() response: Response): Promise<void> {
		const token: string = await this.authUtil.genAuthToken(currentUser);
		response.redirect(`${this.uiUrl}/auth/google/success?token=${token}`);
	}
}
