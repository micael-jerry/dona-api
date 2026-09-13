import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EventStatus } from '../../../../../prisma/generated/enums';
import { CreateEventRequest } from './create-event.request.dto';

export class UpdateEventRequest extends PartialType(CreateEventRequest) {
	@ApiPropertyOptional({
		description: 'Current status of the event',
		enum: EventStatus,
	})
	@IsEnum(EventStatus)
	@IsOptional()
	status?: EventStatus;
}
