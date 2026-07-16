import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../prisma/generated/enums';

export class UserResponse {
	@ApiProperty({ description: 'Unique identifier of the user', example: '123e4567-e89b-12d3-a456-426614174000' })
	id!: string;

	@ApiProperty({ description: 'Email address of the user', example: 'john.doe@example.com' })
	email!: string;

	@ApiProperty({ description: 'Pseudonym of the user', example: 'johndoe' })
	pseudo!: string;

	@ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
	name!: string;

	@ApiProperty({
		description: "URL of the user's avatar image",
		example: 'https://example.com/avatar.jpg',
		nullable: true,
	})
	avatar!: string | null;

	@ApiProperty({ description: "Whether the user's email has been verified", example: true })
	isEmailVerified!: boolean;

	@ApiProperty({ description: 'Timestamp when the user was created', example: '2023-01-01T00:00:00Z' })
	createdAt!: Date;

	@ApiProperty({ description: 'Timestamp when the user was last updated', example: '2023-01-02T00:00:00Z' })
	updatedAt!: Date;

	@ApiProperty({ description: 'Role of the user', enum: UserRole, example: UserRole.USER })
	role!: UserRole;
}
