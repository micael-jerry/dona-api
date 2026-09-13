import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '../../../prisma/generated/enums';
import { CreateEventRequest, DeleteEventResponse, DonaEventResponseDto, UpdateEventRequest } from './dto';
import { EventMapper } from './event.mapper';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
	constructor(private readonly eventRepository: EventRepository) {}

	// Creates an event and records the creator's initial signal in a transaction
	async create(userId: string, createEventDto: CreateEventRequest): Promise<DonaEventResponseDto> {
		const newEvent = await this.eventRepository.createWithConfirmation({
			...createEventDto,
			userId,
		});

		return this.findOnePersonalized(newEvent.id, userId);
	}

	// Confirms that an event is still present (Encore là)
	async confirmEvent(userId: string, eventId: string): Promise<DonaEventResponseDto> {
		const event = await this.eventRepository.findById(eventId);
		if (!event) {
			throw new NotFoundException('Event not found.');
		}

		const existingConfirmation = await this.eventRepository.findConfirmation(userId, eventId);
		if (existingConfirmation) {
			const message =
				event.userId === userId
					? 'You have already confirmed this event upon creation.'
					: 'You have already marked this event as still present.';
			throw new ConflictException(message);
		}

		await this.eventRepository.createConfirmation(userId, eventId);
		return this.findOnePersonalized(eventId, userId);
	}

	// Returns all events with personalized flags for the given user (or guest)
	async findAllPersonalized(userId: string | null = null): Promise<DonaEventResponseDto[]> {
		const events = await this.eventRepository.findAllWithDetails(userId);
		return events.map((event) => EventMapper.toDto(event, userId));
	}

	// Returns a single event with personalized flags for the given user (or guest)
	async findOnePersonalized(id: string, userId: string | null = null): Promise<DonaEventResponseDto> {
		const event = await this.eventRepository.findOneWithDetails(id, userId);
		if (!event) {
			throw new NotFoundException(`Event with ID #${id} not found.`);
		}

		return EventMapper.toDto(event, userId);
	}

	// Allows the event author or an ADMIN to update the event
	async update(
		userId: string,
		id: string,
		updateEventDto: UpdateEventRequest,
		userRole?: UserRole,
	): Promise<DonaEventResponseDto> {
		const event = await this.eventRepository.findById(id);
		if (!event) {
			throw new NotFoundException(`Event with ID #${id} not found.`);
		}

		if (event.userId !== userId && userRole !== UserRole.ADMIN) {
			throw new ForbiddenException('You do not have permission to modify this event.');
		}

		await this.eventRepository.update(id, updateEventDto);
		return this.findOnePersonalized(id, userId);
	}

	// Allows the event author or an ADMIN to delete the event
	async remove(userId: string, id: string, userRole?: UserRole): Promise<DeleteEventResponse> {
		const event = await this.eventRepository.findById(id);
		if (!event) {
			throw new NotFoundException(`Event with ID #${id} not found.`);
		}

		if (event.userId !== userId && userRole !== UserRole.ADMIN) {
			throw new ForbiddenException('You do not have permission to delete this event.');
		}

		await this.eventRepository.delete(id);
		return { message: 'Event deleted successfully.' };
	}
}
