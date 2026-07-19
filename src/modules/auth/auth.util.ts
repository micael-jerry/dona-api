import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../prisma/generated/client';
import { UserPayload } from './payload/user.payload';
import { SpecialPayload, SpecialTokenPurpose } from './payload/special.payload';

@Injectable()
export class AuthUtil {
	constructor(private readonly jwtService: JwtService) {}

	genAuthToken(userPayload: UserPayload): Promise<string> {
		return this.jwtService.signAsync(userPayload);
	}

	verifyToken<T extends object>(token: string): Promise<T> {
		return this.jwtService.verifyAsync<T>(token);
	}

	genSpecialToken({ id, email, role }: User, purpose: SpecialTokenPurpose): Promise<string> {
		const specialPayload: SpecialPayload = { id, email, role, purpose };
		return this.jwtService.signAsync(specialPayload, { expiresIn: '1h' });
	}
}
