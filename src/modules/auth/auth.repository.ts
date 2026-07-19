import { Injectable } from '@nestjs/common';
import { User } from '../../../prisma/generated/client';
import { DbService } from '../../db/db.service';
import { UserCreateInput } from '../../../prisma/generated/models';

@Injectable()
export class AuthRepository {
	constructor(private readonly dbService: DbService) {}

	/**
	 * Creates a new user record in the database.
	 *
	 * @param {UserCreateInput} data - The data to create the user with.
	 * @returns {Promise<User>} The created user.
	 */
	async createUser(data: UserCreateInput): Promise<User> {
		return this.dbService.user.create({ data });
	}

	/**
	 * Finds a user by their email address.
	 * Throws an error if the user is not found.
	 *
	 * @param {string} email - The email address to search for.
	 * @returns {Promise<User>} The found user.
	 * @throws {Error} If no user is found with the given email.
	 */
	async findUserByEmail(email: string): Promise<User> {
		return this.dbService.user.findUniqueOrThrow({ where: { email } });
	}

	/**
	 * Updates a user's status to mark their email as verified.
	 *
	 * @param {string} email - The email address of the user to update.
	 * @returns {Promise<User>} The updated user.
	 */
	async setEmailVerified(email: string): Promise<User> {
		return this.dbService.user.update({
			where: { email },
			data: {
				isEmailVerified: true,
			},
		});
	}

	/**
	 * Updates the password for a specific user.
	 *
	 * @param {string} userId - The ID of the user.
	 * @param {string} hashedPassword - The new hashed password.
	 * @returns {Promise<User>} The updated user.
	 */
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
