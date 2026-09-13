import { Injectable } from '@nestjs/common';
import { Event, Prisma, UserConfirmEvent } from '../../../prisma/generated/client';
import { EventUncheckedCreateInput, EventUpdateInput } from '../../../prisma/generated/models';
import { DbService } from '../../db/db.service';

export type EventWithDetails = Prisma.EventGetPayload<{
	include: {
		user: {
			select: {
				id: true;
				name: true;
				pseudo: true;
				avatar: true;
				_count: {
					select: {
						userConfirmEvents: true;
						userResolveEvents: true;
						events: true;
					};
				};
			};
		};
		eventCategory: true;
		_count: {
			select: {
				confirmations: true;
				resolutions: true;
			};
		};
		confirmations: {
			select: { id: true };
		};
	};
}>;

@Injectable()
export class EventRepository {
	constructor(private readonly dbService: DbService) {}

	// Creates an event and its initial confirmation in a single database transaction
	async createWithConfirmation(data: EventUncheckedCreateInput): Promise<Event> {
		return this.dbService.$transaction(async (tx) => {
			const newEvent = await tx.event.create({ data });

			await tx.userConfirmEvent.create({
				data: {
					userId: data.userId,
					eventId: newEvent.id,
				},
			});

			return newEvent;
		});
	}

	async findById(id: string): Promise<Event | null> {
		return this.dbService.event.findUnique({
			where: { id },
		});
	}

	async findConfirmation(userId: string, eventId: string): Promise<UserConfirmEvent | null> {
		return this.dbService.userConfirmEvent.findUnique({
			where: {
				userId_eventId: {
					userId,
					eventId,
				},
			},
		});
	}

	async createConfirmation(userId: string, eventId: string): Promise<UserConfirmEvent> {
		return this.dbService.userConfirmEvent.create({
			data: {
				userId,
				eventId,
			},
		});
	}

	async update(id: string, data: EventUpdateInput): Promise<Event> {
		return this.dbService.event.update({
			where: { id },
			data,
		});
	}

	async delete(id: string): Promise<Event> {
		return this.dbService.event.delete({
			where: { id },
		});
	}

	// Finds all events with relations and count data
	async findAllWithDetails(userId: string | null = null): Promise<EventWithDetails[]> {
		return this.dbService.event.findMany({
			include: {
				user: {
					select: {
						id: true,
						name: true,
						pseudo: true,
						avatar: true,
						_count: {
							select: {
								userConfirmEvents: true,
								userResolveEvents: true,
								events: true,
							},
						},
					},
				},
				eventCategory: true,
				_count: {
					select: {
						confirmations: true,
						resolutions: true,
					},
				},
				confirmations: userId
					? {
							where: { userId },
							select: { id: true },
						}
					: {
							where: { id: 'non-existing' },
							select: { id: true },
						},
			},
			orderBy: { createdAt: 'desc' },
		});
	}

	// Finds a single event with relations and count data
	async findOneWithDetails(id: string, userId: string | null = null): Promise<EventWithDetails | null> {
		return this.dbService.event.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						pseudo: true,
						avatar: true,
						_count: {
							select: {
								userConfirmEvents: true,
								userResolveEvents: true,
								events: true,
							},
						},
					},
				},
				eventCategory: true,
				_count: {
					select: {
						confirmations: true,
						resolutions: true,
					},
				},
				confirmations: userId
					? {
							where: { userId },
							select: { id: true },
						}
					: {
							where: { id: 'non-existing' },
							select: { id: true },
						},
			},
		});
	}
}
