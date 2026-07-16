import { Injectable } from '@nestjs/common';
import { User } from '../../../prisma/generated/client';
import { UserCreateInput } from '../../../prisma/generated/models';
import { DbService } from '../../db/db.service';

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
}
