import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../../../../prisma/generated/client';
import { EventSeverity, EventStatus } from '../../../../prisma/generated/enums';

export class EventEntity implements Event {
	@ApiProperty({ example: 'clx9876543210fedcba' })
	id: string;

	@ApiProperty({ example: 'clx111222333444555' })
	userId: string;

	@ApiProperty({ example: 'clx1234567890abcdef' })
	eventCategoryId: string;

	@ApiProperty({ enum: EventSeverity, example: EventSeverity.LOW })
	severity: EventSeverity;

	@ApiProperty({ enum: EventStatus, example: EventStatus.ACTIVE })
	status: EventStatus;

	@ApiProperty({ example: -18.8792 })
	latitude: number;

	@ApiProperty({ example: 47.5079 })
	longitude: number;

	@ApiProperty({ example: 'Accident de circulation' })
	title: string;

	@ApiProperty({ example: 'Collision entre deux véhicules au carrefour.' })
	description: string;

	@ApiProperty({ example: '123 Avenue des Champs-Élysées' })
	address: string;

	@ApiProperty({ example: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop' })
	imageUrl: string | null;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;
}
