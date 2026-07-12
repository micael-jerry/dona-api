import { Injectable } from '@nestjs/common';
import { SignupRequest } from './dto/signup-request.dto';
import { User } from '../../../prisma/generated/browser';
import { AuthRepository } from './auth.repository';
import { HashingService } from '../../common/hashing/hashing.service';
import { UserPayload } from './payload/user.payload';
import { LoginResponse } from './dto/login-response.dto';
import { UserMapper } from '../user/user.mapper';
import { AuthUtil } from './auth.util';
import { MailerService } from '../mailer/mailer.service';

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
			token: await this.authUtil.generateToken(userPayload),
			user: UserMapper.toDto(user),
		};
	}
}
