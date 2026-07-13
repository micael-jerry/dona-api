import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../prisma/generated/client';
import { EmailVerificationPayload } from './payload/email-verification.payload';
import { UserPayload } from './payload/user.payload';

@Injectable()
export class AuthUtil {
	constructor(private readonly jwtService: JwtService) {}

	async genAuthToken(userPayload: UserPayload): Promise<string> {
		return await this.jwtService.signAsync(userPayload);
	}

	async verifyToken<T extends object>(token: string): Promise<T> {
		return await this.jwtService.verifyAsync<T>(token);
	}

	async genEmailVerificationToken({ id, email, role }: User): Promise<string> {
		const emailVerificationPayload: EmailVerificationPayload = {
			id,
			email,
			role,
		};
		return await this.jwtService.signAsync(emailVerificationPayload, { expiresIn: '1h' });
	}
}
