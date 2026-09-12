import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EventStatus } from '../../../../prisma/generated/enums';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
	@ApiPropertyOptional({
		description: "Statut actuel de l'événement",
		enum: EventStatus,
	})
	@IsEnum(EventStatus)
	@IsOptional()
	status?: EventStatus;
}
