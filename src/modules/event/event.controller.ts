import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AppAuthGuard } from '../auth/guards/app-auth.guard';
import { AuthType } from '../auth/types/auth.type';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { EventService } from './event.service';

@ApiTags('Events')
@Controller('events')
export class EventController {
	constructor(private readonly eventsService: EventService) {}

	@Auth(AuthType.AUTHENTICATED)
	@UseGuards(AppAuthGuard)
	@Post()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create a new event' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The event has been created successfully.',
		type: EventEntity,
	})
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	create(@CurrentUser('id') userId: string, @Body() createEventDto: CreateEventDto) {
		return this.eventsService.create(userId, createEventDto);
	}

	@Auth(AuthType.AUTHENTICATED)
	@UseGuards(AppAuthGuard)
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

	@Auth(AuthType.AUTHENTICATED)
	@UseGuards(AppAuthGuard)
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
