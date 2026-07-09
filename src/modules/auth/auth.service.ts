import { Injectable } from '@nestjs/common';
import { SignupRequest } from './dto/signup-request.dto';
import { User } from '../../../prisma/generated/browser';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
	constructor(private readonly authRepository: AuthRepository) {}

	async signup(signupRequest: SignupRequest): Promise<User> {
		return await this.authRepository.createUser(signupRequest);
	}
}
