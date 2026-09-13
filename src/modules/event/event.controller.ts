import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthType } from '../auth/types/auth.type';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { EventService } from './event.service';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
@Auth(AuthType.AUTHENTICATED)
export class EventController {
	constructor(private readonly eventsService: EventService) {}

	@ApiOperation({ summary: 'Create a new event' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The event has been created successfully.',
		type: EventEntity,
	})
	@Post()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	create(@CurrentUser('id') userId: string, @Body() createEventDto: CreateEventDto) {
		return this.eventsService.create(userId, createEventDto);
	}

	@Post(':id/confirm')
	@ApiOperation({
		summary: 'Confirm that an event is still present (Encore là)',
	})
	@ApiParam({ name: 'id', description: 'ID of the event to confirm' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The event confirmation has been recorded successfully.',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'The owner cannot confirm their own event.',
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: 'User has already confirmed this event.',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Event not found.',
	})
	confirmEvent(@CurrentUser('id') userId: string, @Param('id') id: string) {
		return this.eventsService.confirmEvent(userId, id);
	}

	@Get('dona')
	@ApiOperation({ summary: 'Retrieve the list of all events' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of events retrieved.',
		type: [EventEntity],
	})
	findAllPersonalized(@CurrentUser('id') userId: string) {
		return this.eventsService.findAllPersonalized(userId);
	}

	@Get('dona/:id')
	@ApiOperation({ summary: 'Retrieve on event with the corresponding id.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of events retrieved.',
		type: [EventEntity],
	})
	findOnePersonalized(@CurrentUser('id') userId: string, @Param('id') id: string) {
		return this.eventsService.findOnePersonalized(userId, id);
	}

	@Get()
	@ApiOperation({ summary: 'Retrieve the list of all events' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of events retrieved.',
		type: [EventEntity],
	})
	findAll() {
		return this.eventsService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrieve an event by its ID' })
	@ApiParam({ name: 'id', description: 'ID of the event' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Details of the event.',
		type: EventEntity,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Event not found.',
	})
	findOne(@Param('id') id: string) {
		return this.eventsService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an event' })
	@ApiParam({ name: 'id', description: 'ID of the event' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The event has been updated.',
		type: EventEntity,
	})
	update(@CurrentUser('id') currentUserId: string, @Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
		return this.eventsService.update(id, currentUserId, updateEventDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete an event' })
	@ApiParam({ name: 'id', description: 'ID of the event' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The event has been deleted.',
	})
	remove(@CurrentUser('id') currentUserId: string, @Param('id') id: string) {
		return this.eventsService.remove(id, currentUserId);
	}
}
