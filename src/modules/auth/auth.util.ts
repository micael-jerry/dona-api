import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { User } from '../../../prisma/generated/client';
import { UserPayload } from './payload/user.payload';
import { SpecialPayload, SpecialTokenPurpose } from './payload/special.payload';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthUtil {
	constructor(
		private readonly jwtService: JwtService,
		private readonly authRepository: AuthRepository,
	) {}

	genAuthToken(userPayload: UserPayload): Promise<string> {
		return this.jwtService.signAsync(userPayload);
	}

	verifyToken<T extends object>(token: string): Promise<T> {
		return this.jwtService.verifyAsync<T>(token);
	}

	/**
	 * Generates a single-use special JWT.
	 * A unique `jti` (JWT ID) is embedded so the token can be invalidated after first use.
	 */
	genSpecialToken({ id, email, role }: User, purpose: SpecialTokenPurpose): Promise<string> {
		const jti = randomUUID();
		const specialPayload: SpecialPayload = { jti, id, email, role, purpose };

		return this.jwtService.signAsync(specialPayload, { expiresIn: '24h', jwtid: jti });
	}

	/**
	 * Verifies a special token and immediately consumes its JTI, making it single-use.
	 *
	 * @throws UnauthorizedException if the token is invalid, expired, or already been used.
	 */
	async verifyAndConsumeSpecialToken<T extends SpecialPayload>(token: string): Promise<T> {
		let payload: T;

		try {
			payload = await this.jwtService.verifyAsync<T>(token);
		} catch {
			throw new UnauthorizedException('Invalid or expired token');
		}

		if (await this.authRepository.isJtiConsumed(payload.jti)) {
			throw new UnauthorizedException('Token has already been used');
		}

		// Derive the absolute expiry date from the `exp` claim (seconds since epoch)
		const expiresAt = new Date((payload as T & { exp: number }).exp * 1000);

		await this.authRepository.consumeJti(payload.jti, expiresAt);

		return payload;
	}
}
