import { Injectable } from '@nestjs/common';
import { User } from '../../../prisma/generated/client';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	/**
	 * Retrieves a user by their unique identifier.
	 *
	 * @param {string} userId - The unique identifier of the user.
	 * @returns {Promise<User>} The requested user object.
	 */
	async getById(userId: string): Promise<User> {
		return this.userRepository.getById(userId);
	}
}
