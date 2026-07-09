import { User } from '../../../prisma/generated/client';
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
}
