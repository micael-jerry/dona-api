import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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

	@ApiOperation({
		summary: 'Create a new event',
		description: 'Creates a new signalment on the map with location and category.',
	})
	@ApiBearerAuth()
	@ApiBody({ type: CreateEventRequest })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The event has been created successfully.',
		type: DonaEventResponseDto,
	})
	@ApiCommonHttpErrorDecorator()
	@Auth(AuthType.AUTHENTICATED)
	@Post()
	create(
		@CurrentUser() { id }: UserPayload,
		@Body() createEventDto: CreateEventRequest,
	): Promise<DonaEventResponseDto> {
		return this.eventsService.create(id, createEventDto);
	}

	@ApiOperation({
		summary: 'Confirm that an event is still present (Still there)',
		description: 'Increments the confirmation count for an active event.',
	})
	@ApiBearerAuth()
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
	@Auth(AuthType.AUTHENTICATED)
	@HttpCode(HttpStatus.OK)
	@Post(':id/confirm')
	confirmEvent(
		@CurrentUser() { id: userId }: UserPayload,
		@Param('id') eventId: string,
	): Promise<DonaEventResponseDto> {
		return this.eventsService.confirmEvent(userId, eventId);
	}

	@ApiOperation({
		summary: 'Retrieve all events for the interactive map',
		description: 'Fetches active events within the platform, personalized if a valid Bearer token is provided.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of events retrieved successfully.',
		type: [DonaEventResponseDto],
	})
	@ApiCommonHttpErrorDecorator()
	@Auth(AuthType.PUBLIC)
	@Get()
	findAll(@CurrentUser() user?: UserPayload): Promise<DonaEventResponseDto[]> {
		return this.eventsService.findAllPersonalized(user?.id ?? null);
	}

	@ApiOperation({
		summary: 'Retrieve a single event by its ID',
		description: 'Retrieves complete event details, personalized if a valid Bearer token is provided.',
	})
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
	@Auth(AuthType.PUBLIC)
	@Get(':id')
	findOne(@CurrentUser() user: UserPayload | undefined, @Param('id') id: string): Promise<DonaEventResponseDto> {
		return this.eventsService.findOnePersonalized(id, user?.id ?? null);
	}

	@ApiOperation({
		summary: 'Update an event (author or admin only)',
		description: 'Modifies fields of an existing event. Only the author or an admin can perform this operation.',
	})
	@ApiBearerAuth()
	@ApiParam({ name: 'id', description: 'ID of the event' })
	@ApiBody({ type: UpdateEventRequest })
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
	@Auth(AuthType.AUTHENTICATED)
	@Patch(':id')
	update(
		@CurrentUser() user: UserPayload,
		@Param('id') id: string,
		@Body() updateEventDto: UpdateEventRequest,
	): Promise<DonaEventResponseDto> {
		return this.eventsService.update(user.id, id, updateEventDto, user.role);
	}

	@ApiOperation({
		summary: 'Delete an event (author or admin only)',
		description: 'Removes an event from the map. Only the author or an admin can perform this operation.',
	})
	@ApiBearerAuth()
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
	@Auth(AuthType.AUTHENTICATED)
	@Delete(':id')
	remove(@CurrentUser() user: UserPayload, @Param('id') id: string): Promise<DeleteEventResponse> {
		return this.eventsService.remove(user.id, id, user.role);
	}
}
