import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './payload/user.payload';

@Injectable()
export class AuthUtil {
	constructor(private readonly jwtService: JwtService) {}

	async generateToken(userPayload: UserPayload): Promise<string> {
		return await this.jwtService.signAsync(userPayload);
	}

	async verifyToken(token: string): Promise<UserPayload> {
		return await this.jwtService.verifyAsync(token);
	}
}
