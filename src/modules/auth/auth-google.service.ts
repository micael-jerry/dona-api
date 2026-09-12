import { BadRequestException, Injectable } from '@nestjs/common';
import { Profile } from 'passport-google-oauth20';
import { generateFromEmail } from 'unique-username-generator';
import { User } from '../../../prisma/generated/client';
import { UserCreateInput } from '../../../prisma/generated/models';
import { MailerService } from '../mailer/mailer.service';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthGoogleService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly mailerService: MailerService,
	) {}

	/**
	 * Validates a user based on their Google OAuth profile.
	 * If the user exists, returns the user. Otherwise, creates a new user,
	 * marks their email as verified, generates a pseudo if not provided,
	 * sends a welcome email, and returns the newly created user.
	 *
	 * @param {Profile} profile - The Google OAuth profile information.
	 * @returns {Promise<User>} The existing or newly created user.
	 * @throws {BadRequestException} If the Google profile does not contain an email.
	 */
	async validateUser(profile: Profile): Promise<User> {
		if (!profile._json.email) {
			throw new BadRequestException('Invalid Email');
		}

		try {
			return await this.authRepository.findUserByEmail(profile._json.email);
		} catch {
			const userToCreate: UserCreateInput = {
				email: profile._json.email,
				isEmailVerified: true,
				name: profile.displayName,
				pseudo: profile.username || generateFromEmail(profile._json.email, 5),
				avatar: profile._json.picture,
				isOAuthGoogleProvider: true,
			};
			const user = await this.authRepository.createUser(userToCreate);
			this.mailerService.sendWelcomeEmail(user);
			return user;
		}
	}
}
