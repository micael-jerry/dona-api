import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../../../prisma/generated/browser';
import { HashingService } from '../../common/hashing/hashing.service';
import { MailerService } from '../mailer/mailer.service';
import { UserMapper } from '../user/user.mapper';
import { AuthRepository } from './auth.repository';
import { AuthUtil } from './auth.util';
import { LoginResponse } from './dto/login-response.dto';
import { SignupRequest } from './dto/signup-request.dto';
import { EmailVerificationPayload } from './payload/email-verification.payload';
import { UserPayload } from './payload/user.payload';

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
			await this.authUtil.genEmailVerificationToken(createdUser),
		);

		return createdUser;
	}

	async validateUser(email: string, pass: string): Promise<User | null> {
		const user: User = await this.authRepository.findUserByEmail(email);

		const isPasswordValid = await this.hashingService.compare(pass, user.password);

		if (!isPasswordValid) {
			return null;
		}

		return user;
	}

	async login(userPayload: UserPayload): Promise<LoginResponse> {
		const user = await this.authRepository.findUserByEmail(userPayload.email);

		return {
			token: await this.authUtil.genAuthToken(userPayload),
			user: UserMapper.toDto(user),
		};
	}

	async verifyEmail(verifyEmailToken: string): Promise<User> {
		try {
			const payload: EmailVerificationPayload =
				await this.authUtil.verifyToken<EmailVerificationPayload>(verifyEmailToken);

			const user: User = await this.authRepository.findUserByEmail(payload.email);
			if (user.isEmailVerified) {
				throw new BadRequestException('Email already verified');
			}
			return await this.authRepository.setEmailVerified(user.email);
		} catch {
			throw new BadRequestException('Invalid or expired email verification token');
		}
	}
}
