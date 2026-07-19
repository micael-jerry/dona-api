import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { User } from '../../../../prisma/generated/client';
import { AuthGoogleService } from '../auth-google.service';
import { Injectable } from '@nestjs/common';
import { AuthUtil } from '../auth.util';
import { UserPayload } from '../payload/user.payload';
import { UserMapper } from '../../user/user.mapper';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly authGoogleService: AuthGoogleService,
		private readonly authUtil: AuthUtil,
	) {
		super({
			clientID: configService.getOrThrow<string>('app.google.clientId'),
			clientSecret: configService.getOrThrow<string>('app.google.clientSecret'),
			callbackURL: configService.getOrThrow<string>('app.google.callbackUrl'),
			scope: ['email', 'profile'],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): Promise<void> {
		const user: User = await this.authGoogleService.validateUser(profile);
		const payload: UserPayload = UserMapper.toPayload(user);

		return done(null, payload);
	}
}
