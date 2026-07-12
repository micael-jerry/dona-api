import { Injectable } from '@nestjs/common';
import { SignupRequest } from './dto/signup-request.dto';
import { User } from '../../../prisma/generated/browser';
import { AuthRepository } from './auth.repository';
import { HashingService } from '../../common/hashing/hashing.service';
import { UserPayload } from './payload/user.payload';
import { LoginResponse } from './dto/login-response.dto';
import { UserMapper } from '../user/user.mapper';
import { AuthUtil } from './auth.util';

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly hashingService: HashingService,
		private readonly authUtil: AuthUtil,
	) {}

	async signup(signupRequest: SignupRequest): Promise<User> {
		const hashedPassword = await this.hashingService.hash(signupRequest.password);

		return this.authRepository.createUser({
			...signupRequest,
			password: hashedPassword,
		});
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
