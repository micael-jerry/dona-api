import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../../../prisma/generated/client';
import { HashingService } from '../../common/hashing/hashing.service';
import { MailerService } from '../mailer/mailer.service';
import { AuthRepository } from './auth.repository';
import { AuthUtil } from './auth.util';
import { ResetPasswordRequest, ResetPasswordRequestRequest, SignupRequest } from './dto/request';
import { ResetPasswordRequestResponse } from './dto/response';
import { SpecialPayload, SpecialTokenPurpose } from './payload/special.payload';
import { UserPayload } from './payload/user.payload';

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly hashingService: HashingService,
		private readonly authUtil: AuthUtil,
		private readonly mailerService: MailerService,
	) {}

	/**
	 * Registers a new user.
	 * Hashes the user's password, creates the user record in the database,
	 * and triggers welcome and verification emails.
	 *
	 * @param {SignupRequest} signupData - The user's registration data including password.
	 * @returns {Promise<User>} The created user object.
	 */
	async signup({ password, ...rest }: SignupRequest): Promise<User> {
		const hashedPassword = await this.hashingService.hash(password);

		const createdUser: User = await this.authRepository.createUser({
			...rest,
			password: hashedPassword,
		});

		this.mailerService.sendWelcomeEmail(createdUser);
		this.mailerService.sendVerificationEmail(
			createdUser,
			await this.authUtil.genSpecialToken(createdUser, SpecialTokenPurpose.VERIFY_EMAIL),
		);

		return createdUser;
	}

	/**
	 * Validates a user's credentials.
	 * Checks if the user exists and if the provided password matches the hashed password.
	 *
	 * @param {string} email - The user's email address.
	 * @param {string} pass - The user's plain text password.
	 * @returns {Promise<User | null>} The user object if validation succeeds, null otherwise.
	 * @throws {BadRequestException} If the user registered via Google OAuth and has no password.
	 */
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

	/**
	 * Generates an authentication token for a validated user.
	 *
	 * @param {UserPayload} userPayload - The payload containing basic user information.
	 * @returns {Promise<{ token: string; user: User }>} An object containing the generated JWT token and the full user object.
	 */
	async login(userPayload: UserPayload): Promise<{ token: string; user: User }> {
		const user = await this.authRepository.findUserByEmail(userPayload.email);

		return {
			token: await this.authUtil.genAuthToken(userPayload),
			user,
		};
	}

	/**
	 * Verifies a user's email address using a special verification token.
	 *
	 * @param {string} verifyEmailToken - The token sent to the user's email.
	 * @returns {Promise<User>} The updated user object with email verified.
	 * @throws {BadRequestException} If the email is already verified.
	 */
	async verifyEmail(verifyEmailToken: string): Promise<User> {
		const payload: SpecialPayload = await this.authUtil.verifyAndConsumeSpecialToken<SpecialPayload>(verifyEmailToken);

		const user: User = await this.authRepository.findUserByEmail(payload.email);

		if (user.isEmailVerified) {
			throw new BadRequestException('Email already verified');
		}

		return this.authRepository.setEmailVerified(user.email);
	}

	/**
	 * Initiates a password reset process by generating a token and sending an email.
	 *
	 * @param {ResetPasswordRequestRequest} requestData - The request containing the user's email.
	 * @returns {Promise<ResetPasswordRequestResponse>} An object containing the user's email.
	 * @throws {BadRequestException} If the user's email has not been verified.
	 */
	async resetPasswordRequest({ email }: ResetPasswordRequestRequest): Promise<ResetPasswordRequestResponse> {
		const user: User = await this.authRepository.findUserByEmail(email);

		if (!user.isEmailVerified) {
			throw new BadRequestException(
				'Your email address has not been verified yet. Please verify your email before requesting a password reset.',
			);
		}

		const resetPasswordToken = await this.authUtil.genSpecialToken(user, SpecialTokenPurpose.RESET_PASSWORD);
		this.mailerService.sendResetPasswordEmail(user, resetPasswordToken);

		return { email: user.email };
	}

	/**
	 * Resets a user's password using a valid reset token.
	 *
	 * @param {ResetPasswordRequest} requestData - The request containing the reset token and the new password.
	 * @returns {Promise<User>} The updated user object.
	 */
	async resetPassword({ resetPasswordToken, newPassword }: ResetPasswordRequest): Promise<User> {
		const payload: SpecialPayload =
			await this.authUtil.verifyAndConsumeSpecialToken<SpecialPayload>(resetPasswordToken);

		const user: User = await this.authRepository.findUserByEmail(payload.email);
		const hashedPassword = await this.hashingService.hash(newPassword);

		return this.authRepository.updatePassword(user.id, hashedPassword);
	}
}
