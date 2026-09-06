import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../../../../prisma/generated/client';
import { UserMapper } from '../../user/user.mapper';
import { AuthService } from '../auth.service';
import { UserPayload } from '../payload/user.payload';

/**
 * Passport strategy for local authentication using email and password.
 * Validates the user credentials against the database.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: 'email',
			passwordField: 'password',
		});
	}

	async validate(email: string, password: string): Promise<UserPayload> {
		const user: User | null = await this.authService.validateUser(email, password);

		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		return UserMapper.toPayload(user);
	}
}
