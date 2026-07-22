import { Injectable } from '@nestjs/common';
import { User } from '../../../prisma/generated/client';
import { DbService } from '../../db/db.service';
import { UpdateProfileRequest } from './dto/request';

@Injectable()
export class AccountRepository {
	constructor(private readonly dbService: DbService) {}

	/**
	 * Finds a user by their unique ID.
	 *
	 * @param {string} userId - The unique identifier of the user.
	 * @returns {Promise<User>} The user record.
	 */
	async findById(userId: string): Promise<User> {
		return this.dbService.user.findUniqueOrThrow({
			where: { id: userId },
		});
	}

	/**
	 * Finds a user by pseudo excluding a specific user ID.
	 * Used for checking pseudo availability during profile updates.
	 *
	 * @param {string} pseudo - The pseudo to search.
	 * @param {string} excludeUserId - User ID to exclude from match.
	 * @returns {Promise<User | null>} The user if found, null otherwise.
	 */
	async findByPseudoExcludingUser(pseudo: string, excludeUserId: string): Promise<User | null> {
		return this.dbService.user.findFirst({
			where: {
				pseudo,
				NOT: { id: excludeUserId },
			},
		});
	}

	/**
	 * Updates simple profile fields for a user.
	 *
	 * @param {string} userId - The ID of the user.
	 * @param {UpdateProfileRequest} data - The updated profile data.
	 * @returns {Promise<User>} The updated user.
	 */
	async updateProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
		return this.dbService.user.update({
			where: { id: userId },
			data: {
				...(data.name !== undefined && { name: data.name }),
				...(data.pseudo !== undefined && { pseudo: data.pseudo }),
				...(data.avatar !== undefined && { avatar: data.avatar }),
			},
		});
	}

	/**
	 * Updates the password for a user.
	 *
	 * @param {string} userId - The ID of the user.
	 * @param {string} hashedPassword - The newly hashed password.
	 * @returns {Promise<User>} The updated user.
	 */
	async updatePassword(userId: string, hashedPassword: string): Promise<User> {
		return this.dbService.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		});
	}

	/**
	 * Deletes a user account.
	 *
	 * @param {string} userId - The ID of the user to delete.
	 * @returns {Promise<User>} The deleted user.
	 */
	async deleteUser(userId: string): Promise<User> {
		return this.dbService.user.delete({
			where: { id: userId },
		});
	}
}
