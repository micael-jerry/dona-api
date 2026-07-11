import { Injectable } from '@nestjs/common';
import { SignupRequest } from './dto/signup-request.dto';
import { User } from '../../../prisma/generated/browser';
import { AuthRepository } from './auth.repository';
import { HashingService } from '../../common/hashing/hashing.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly hashingService: HashingService,
	) {}

	async signup(signupRequest: SignupRequest): Promise<User> {
		const hashedPassword = await this.hashingService.hash(signupRequest.password);

		return this.authRepository.createUser({
			...signupRequest,
			password: hashedPassword,
		});
	}
}
