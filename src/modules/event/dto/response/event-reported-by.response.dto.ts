import { ApiProperty } from '@nestjs/swagger';

export class EventReportedByResponseDto {
	@ApiProperty({ description: 'Whether the current authenticated user is the author', example: false })
	isOwner!: boolean;

	@ApiProperty({ description: 'Author name', example: 'Alice Martin' })
	name!: string;

	@ApiProperty({
		description: 'Author avatar URL',
		example: 'https://api.dicebear.com/10.x/avataaars-neutral/png?seed=Felix',
	})
	avatarUrl!: string;

	@ApiProperty({ description: 'Author community reputation score', example: 12 })
	reputationScore!: number;
}
