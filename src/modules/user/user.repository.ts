import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { User } from '../../../prisma/generated/client';

@Injectable()
export class UserRepository {
	constructor(private readonly dbService: DbService) {}

	async getById(userId: string): Promise<User> {
		return this.dbService.user.findUniqueOrThrow({
			where: {
				id: userId,
			},
		});
	}
}
