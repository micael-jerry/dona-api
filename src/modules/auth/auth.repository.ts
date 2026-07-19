import { Injectable } from '@nestjs/common';
import { User } from '../../../prisma/generated/client';
import { DbService } from '../../db/db.service';
import { UserCreateInput } from '../../../prisma/generated/models';

@Injectable()
export class AuthRepository {
	constructor(private readonly dbService: DbService) {}

	async createUser(data: UserCreateInput): Promise<User> {
		return this.dbService.user.create({ data });
	}

	async findUserByEmail(email: string): Promise<User> {
		return this.dbService.user.findUniqueOrThrow({ where: { email } });
	}

	async setEmailVerified(email: string): Promise<User> {
		return this.dbService.user.update({
			where: { email },
			data: {
				isEmailVerified: true,
			},
		});
	}

	async updatePassword(userId: string, hashedPassword: string): Promise<User> {
		return this.dbService.user.update({
			where: { id: userId },
			data: {
				password: hashedPassword,
			},
		});
	}

	/**
	 * Returns true if the given JTI has already been consumed (token was used).
	 */
	async isJtiConsumed(jti: string): Promise<boolean> {
		const record = await this.dbService.usedToken.findUnique({ where: { jti } });
		return record !== null;
	}

	/**
	 * Marks a JTI as consumed, preventing any future use of the associated token.
	 * @param expiresAt - mirrors the token expiry so stale records can be purged later.
	 */
	async consumeJti(jti: string, expiresAt: Date): Promise<void> {
		await this.dbService.usedToken.create({ data: { jti, expiresAt } });
	}
}
