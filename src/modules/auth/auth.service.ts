import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../../../prisma/generated/client';
import { HashingService } from '../../common/hashing/hashing.service';
import { MailerService } from '../mailer/mailer.service';
import { AuthRepository } from './auth.repository';
import { AuthUtil } from './auth.util';
import { UserPayload } from './payload/user.payload';
import { SpecialPayload, SpecialTokenPurpose } from './payload/special.payload';
import { SignupRequest, ResetPasswordRequestRequest, ResetPasswordRequest } from './dto/request';
import { ResetPasswordRequestResponse } from './dto/response';

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly hashingService: HashingService,
		private readonly authUtil: AuthUtil,
		private readonly mailerService: MailerService,
	) {}

	async signup(signupRequest: SignupRequest): Promise<User> {
		const hashedPassword = await this.hashingService.hash(signupRequest.password);

		const createdUser: User = await this.authRepository.createUser({
			...signupRequest,
			password: hashedPassword,
		});

		await this.mailerService.sendWelcomeEmail(createdUser);
		await this.mailerService.sendVerificationEmail(
			createdUser,
			await this.authUtil.genSpecialToken(createdUser, SpecialTokenPurpose.VERIFY_EMAIL),
		);

		return createdUser;
	}

	async validateUser(email: string, pass: string): Promise<User | null> {
		let user: User;

		try {
			user = await this.authRepository.findUserByEmail(email);
		} catch {
			return null;
		}

		if (!user.password) {
			throw new BadRequestException('Please use the Google OAuth provider to log in');
		}

		return (await this.hashingService.compare(pass, user.password)) ? user : null;
	}

	async login(userPayload: UserPayload): Promise<{ token: string; user: User }> {
		const user = await this.authRepository.findUserByEmail(userPayload.email);

		return {
			token: await this.authUtil.genAuthToken(userPayload),
			user,
		};
	}

	async verifyEmail(verifyEmailToken: string): Promise<User> {
		const payload: SpecialPayload = await this.authUtil.verifyAndConsumeSpecialToken<SpecialPayload>(verifyEmailToken);

		const user: User = await this.authRepository.findUserByEmail(payload.email);

		if (user.isEmailVerified) {
			throw new BadRequestException('Email already verified');
		}

		return this.authRepository.setEmailVerified(user.email);
	}

	async resetPasswordRequest({ email }: ResetPasswordRequestRequest): Promise<ResetPasswordRequestResponse> {
		const user: User = await this.authRepository.findUserByEmail(email);

		if (!user.isEmailVerified) {
			throw new BadRequestException(
				'Your email address has not been verified yet. Please verify your email before requesting a password reset.',
			);
		}

		const resetPasswordToken = await this.authUtil.genSpecialToken(user, SpecialTokenPurpose.RESET_PASSWORD);
		await this.mailerService.sendResetPasswordEmail(user, resetPasswordToken);

		return { email: user.email };
	}

	async resetPassword({ resetPasswordToken, newPassword }: ResetPasswordRequest): Promise<User> {
		const payload: SpecialPayload =
			await this.authUtil.verifyAndConsumeSpecialToken<SpecialPayload>(resetPasswordToken);

		const user: User = await this.authRepository.findUserByEmail(payload.email);
		const hashedPassword = await this.hashingService.hash(newPassword);

		return this.authRepository.updatePassword(user.id, hashedPassword);
	}
}
