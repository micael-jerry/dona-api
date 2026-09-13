import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsDateString,
	IsEnum,
	IsLatitude,
	IsLongitude,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';
import { EventSeverity } from '../../../../../prisma/generated/enums';

export class CreateEventRequest {
	@ApiProperty({
		description: 'Event category ID',
		example: 'cat_accident_01',
	})
	@IsString()
	@IsNotEmpty()
	eventCategoryId!: string;

	@ApiProperty({
		description: 'Event title',
		maxLength: 150,
		example: 'Traffic Accident',
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(150)
	title!: string;

	@ApiProperty({
		description: 'Event description',
		example: 'Collision between two vehicles at the intersection.',
	})
	@IsString()
	@IsNotEmpty()
	description!: string;

	@ApiProperty({
		description: 'Physical address or approximate location',
		maxLength: 255,
		example: 'Rue Raseta, Antananarivo, Madagascar',
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	address!: string;

	@ApiProperty({
		description: 'GPS latitude',
		example: -18.8792,
	})
	@IsLatitude()
	@IsNotEmpty()
	latitude!: number;

	@ApiProperty({
		description: 'GPS longitude',
		example: 47.5079,
	})
	@IsLongitude()
	@IsNotEmpty()
	longitude!: number;

	@ApiPropertyOptional({
		description: 'Event severity level',
		enum: EventSeverity,
		default: EventSeverity.LOW,
	})
	@IsEnum(EventSeverity)
	@IsOptional()
	severity?: EventSeverity;

	@ApiPropertyOptional({
		description: 'Optional photo URL of the incident',
		example: 'https://images.unsplash.com/photo-1563720223185-11003d516935',
	})
	@IsUrl()
	@IsOptional()
	imageUrl?: string;

	@ApiPropertyOptional({
		description: 'Optional expiration timestamp',
		example: '2026-09-13T22:00:00.000Z',
	})
	@IsDateString()
	@IsOptional()
	expiresAt?: Date;
}
