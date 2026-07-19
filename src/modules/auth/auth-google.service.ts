import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { Profile } from 'passport-google-oauth20';
import { User } from '../../../prisma/generated/client';
import { UserCreateInput } from '../../../prisma/generated/models';
import { generateFromEmail } from 'unique-username-generator';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthGoogleService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly mailerService: MailerService,
	) {}

	async validateUser(profile: Profile): Promise<User> {
		if (!profile._json.email) {
			throw new BadRequestException('Invalid Email');
		}

		return this.authRepository
			.findUserByEmail(profile._json.email)
			.then((user: User) => {
				return user;
			})
			.catch(() => {
				const userToCreate: UserCreateInput = {
					email: profile._json.email!,
					isEmailVerified: true,
					name: profile.displayName,
					pseudo: profile.username || generateFromEmail(profile._json.email!, 5),
					avatar: profile._json.picture,
					isOAuthGoogleProvider: true,
				};
				return this.authRepository.createUser(userToCreate).then(async (user: User) => {
					await this.mailerService.sendWelcomeEmail(user);
					return user;
				});
			});
	}
}
