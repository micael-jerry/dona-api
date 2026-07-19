import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../../../prisma/generated/client';
import { UserPayload } from '../payload/user.payload';
import { UserMapper } from '../../user/user.mapper';

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
