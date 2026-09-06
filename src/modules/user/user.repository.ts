import { Injectable } from '@nestjs/common';
import { User } from '../../../prisma/generated/client';
import { DbService } from '../../db/db.service';

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
