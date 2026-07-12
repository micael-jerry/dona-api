import { User } from '../../../prisma/generated/client';
import { UserPayload } from '../auth/payload/user.payload';
import { UserResponse } from './dto/user-response.dto';

export class UserMapper {
	static toDto(entity: User): UserResponse {
		return {
			id: entity.id,
			email: entity.email,
			pseudo: entity.pseudo,
			name: entity.name,
			avatar: entity.avatar,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
			role: entity.role,
		} satisfies UserResponse;
	}

	static toPayload(entity: User): UserPayload {
		return {
			id: entity.id,
			email: entity.email,
			pseudo: entity.pseudo,
			name: entity.name,
			role: entity.role,
		} satisfies UserPayload;
	}
}
