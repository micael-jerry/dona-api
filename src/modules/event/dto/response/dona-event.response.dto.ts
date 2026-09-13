import { ApiProperty } from '@nestjs/swagger';
import { EventLocationResponseDto } from './event-location.response.dto';
import { EventReportedByResponseDto } from './event-reported-by.response.dto';

export class DonaEventResponseDto {
	@ApiProperty({ description: 'Unique identifier of the event', example: 'clx9876543210fedcba' })
	id!: string;

	@ApiProperty({ description: 'Event title', example: 'Traffic Accident' })
	title!: string;

	@ApiProperty({
		description: 'Event description',
		example: 'Collision between two vehicles at the intersection.',
	})
	description!: string;

	@ApiProperty({ description: 'GPS coordinates', type: () => EventLocationResponseDto })
	location!: EventLocationResponseDto;

	@ApiProperty({ description: 'Physical address or landmark name', example: 'Rue Raseta, Antananarivo' })
	addressName!: string;

	@ApiProperty({ description: 'Incident category value', example: 'accident', nullable: true })
	category!: string | null;

	@ApiProperty({ description: 'Severity level (LOW, MEDIUM, HIGH, CRITICAL)', example: 'LOW' })
	severity!: string;

	@ApiProperty({ description: 'Current status (ACTIVE, RESOLVING, EXPIRED)', example: 'active', nullable: true })
	status!: string | null;

	@ApiProperty({ description: 'Dynamic veracity score (0 to 100)', example: 66 })
	veracityScore!: number;

	@ApiProperty({ description: 'Number of community confirmations', example: 2 })
	confirmationsCount!: number;

	@ApiProperty({ description: 'Number of resolution reports', example: 0 })
	resolutionsCount!: number;

	@ApiProperty({ description: 'Whether the event has reached official validation threshold', example: false })
	isOfficialValidated!: boolean;

	@ApiProperty({
		description: 'Whether the current authenticated user has confirmed this event',
		example: true,
	})
	hasUserConfirmed!: boolean;

	@ApiProperty({ description: 'Creation timestamp', example: '2026-09-13T10:00:00.000Z' })
	createdAt!: Date;

	@ApiProperty({ description: 'Author details and reputation', type: () => EventReportedByResponseDto })
	reportedBy!: EventReportedByResponseDto;

	@ApiProperty({
		description: 'Attached photo evidence URL',
		example: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop',
		nullable: true,
	})
	imageUrl!: string | null;
}
