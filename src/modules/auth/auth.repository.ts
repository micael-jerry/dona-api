import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { UserCreateInput } from '../../../prisma/generated/models';
import { User } from '../../../prisma/generated/client';

@Injectable()
export class AuthRepository {
	constructor(private readonly dbService: DbService) {}

	async createUser(data: UserCreateInput): Promise<User> {
		return this.dbService.user.create({ data });
	}
}
