import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';

@ApiTags('Events')
@Controller('events')
export class EventController {
	constructor(private readonly eventsService: EventService) {}

	@Post()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create a new event' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The event has been created successfully.',
		type: EventEntity,
	})
	create(@Body() createEventDto: CreateEventDto) {
		// Remplacer 'USER_ID_MOCK' par l'ID récupéré de votre Request/JWT (ex: req.user.id)
		const mockUserId = 'clx111222333444555';
		return this.eventsService.create(mockUserId, createEventDto);
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
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update an event' })
	@ApiParam({ name: 'id', description: 'ID of the event' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The event has been updated.',
		type: EventEntity,
	})
	update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
		return this.eventsService.update(id, updateEventDto);
	}

	@Delete(':id')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete an event' })
	@ApiParam({ name: 'id', description: 'ID of the event' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The event has been deleted.',
	})
	remove(@Param('id') id: string) {
		return this.eventsService.remove(id);
	}
}
