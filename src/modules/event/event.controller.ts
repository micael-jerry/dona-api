import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonHttpErrorDecorator } from '../../common/decorators/api-common-http-error.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserPayload } from '../auth/payload/user.payload';
import { AuthType } from '../auth/types/auth.type';
import { CreateEventRequest, DeleteEventResponse, DonaEventResponseDto, UpdateEventRequest } from './dto';
import { EventService } from './event.service';

@ApiTags('Events')
@Controller('events')
export class EventController {
	constructor(private readonly eventsService: EventService) {}

	@Auth(AuthType.AUTHENTICATED)
	@Post()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create a new event' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The event has been created successfully.',
		type: DonaEventResponseDto,
	})
	@ApiCommonHttpErrorDecorator()
	create(
		@CurrentUser() { id }: UserPayload,
		@Body() createEventDto: CreateEventRequest,
	): Promise<DonaEventResponseDto> {
		return this.eventsService.create(id, createEventDto);
	}

	@Auth(AuthType.AUTHENTICATED)
	@Post(':id/confirm')
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Confirm that an event is still present (Still there)',
	})
	@ApiParam({ name: 'id', description: 'ID of the event to confirm' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The event confirmation has been recorded successfully.',
		type: DonaEventResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid confirmation request.',
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: 'User has already confirmed this event.',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Event not found.',
	})
	@ApiCommonHttpErrorDecorator()
	confirmEvent(
		@CurrentUser() { id: userId }: UserPayload,
		@Param('id') eventId: string,
	): Promise<DonaEventResponseDto> {
		return this.eventsService.confirmEvent(userId, eventId);
	}

	@Auth(AuthType.PUBLIC)
	@Get()
	@ApiOperation({ summary: 'Retrieve all events for the interactive map' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of events retrieved successfully.',
		type: [DonaEventResponseDto],
	})
	@ApiCommonHttpErrorDecorator()
	findAll(@CurrentUser() user?: UserPayload): Promise<DonaEventResponseDto[]> {
		return this.eventsService.findAllPersonalized(user?.id ?? null);
	}

	@Auth(AuthType.PUBLIC)
	@Get('dona')
	@ApiOperation({ summary: 'Retrieve all events for the interactive map (alias)' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of events retrieved successfully.',
		type: [DonaEventResponseDto],
	})
	@ApiCommonHttpErrorDecorator()
	findAllPersonalized(@CurrentUser() user?: UserPayload): Promise<DonaEventResponseDto[]> {
		return this.eventsService.findAllPersonalized(user?.id ?? null);
	}

	@Auth(AuthType.PUBLIC)
	@Get('dona/:id')
	@ApiOperation({ summary: 'Retrieve a single event by ID (alias)' })
	@ApiParam({ name: 'id', description: 'ID of the event' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Event retrieved successfully.',
		type: DonaEventResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Event not found.',
	})
	@ApiCommonHttpErrorDecorator()
	findOnePersonalizedAlias(
		@CurrentUser() user: UserPayload | undefined,
		@Param('id') id: string,
	): Promise<DonaEventResponseDto> {
		return this.eventsService.findOnePersonalized(id, user?.id ?? null);
	}

	@Auth(AuthType.PUBLIC)
	@Get(':id')
	@ApiOperation({ summary: 'Retrieve a single event by its ID' })
	@ApiParam({ name: 'id', description: 'ID of the event' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Event retrieved successfully.',
		type: DonaEventResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Event not found.',
	})
	@ApiCommonHttpErrorDecorator()
	findOne(@CurrentUser() user: UserPayload | undefined, @Param('id') id: string): Promise<DonaEventResponseDto> {
		return this.eventsService.findOnePersonalized(id, user?.id ?? null);
	}

	@Auth(AuthType.AUTHENTICATED)
	@Patch(':id')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update an event (author or admin only)' })
	@ApiParam({ name: 'id', description: 'ID of the event' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The event has been updated successfully.',
		type: DonaEventResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Insufficient permissions to update this event.',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Event not found.',
	})
	@ApiCommonHttpErrorDecorator()
	update(
		@CurrentUser() user: UserPayload,
		@Param('id') id: string,
		@Body() updateEventDto: UpdateEventRequest,
	): Promise<DonaEventResponseDto> {
		return this.eventsService.update(user.id, id, updateEventDto, user.role);
	}

	@Auth(AuthType.AUTHENTICATED)
	@Delete(':id')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete an event (author or admin only)' })
	@ApiParam({ name: 'id', description: 'ID of the event' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The event has been deleted successfully.',
		type: DeleteEventResponse,
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Insufficient permissions to delete this event.',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Event not found.',
	})
	@ApiCommonHttpErrorDecorator()
	remove(@CurrentUser() user: UserPayload, @Param('id') id: string): Promise<DeleteEventResponse> {
		return this.eventsService.remove(user.id, id, user.role);
	}
}
