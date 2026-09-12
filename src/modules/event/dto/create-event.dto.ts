import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EventSeverity } from '../../../../prisma/generated/enums';

export class CreateEventDto {
	@ApiProperty({
		description: 'Event category ID',
		example: 'clx1234567890abcdef',
	})
	@IsString()
	@IsNotEmpty()
	eventCategoryId: string;

	@ApiProperty({
		description: 'Event title',
		maxLength: 150,
		example: 'Traffic Accident',
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(150)
	title: string;

	@ApiProperty({
		description: 'Event description',
		example: 'Collision between two vehicles at the intersection.',
	})
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty({
		description: 'Physical address or approximate location',
		maxLength: 255,
		example: 'Rue Raseta, Antananarivo, Madagascar',
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	address: string;

	@ApiProperty({
		description: 'GPS latitude',
		example: -18.8792,
	})
	@IsLatitude()
	@IsNotEmpty()
	latitude: number;

	@ApiProperty({
		description: 'GPS longitude',
		example: 47.5079,
	})
	@IsLongitude()
	@IsNotEmpty()
	longitude: number;

	@ApiPropertyOptional({
		description: 'Event severity',
		enum: EventSeverity,
		default: EventSeverity.LOW,
	})
	@IsEnum(EventSeverity)
	@IsOptional()
	severity?: EventSeverity;
}
