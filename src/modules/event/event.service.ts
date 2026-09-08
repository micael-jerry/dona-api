import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
	constructor(private readonly db: DbService) {}

	async create(userId: string, createEventDto: CreateEventDto) {
		return this.db.event.create({
			data: {
				...createEventDto,
				userId,
			},
		});
	}

	async findAll() {
		return this.db.event.findMany({
			include: {
				user: {
					select: { id: true, pseudo: true, avatar: true },
				},
				eventCategory: true,
				_count: {
					select: { confirmations: true, resolutions: true },
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	}

	async findOne(id: string) {
		const event = await this.db.event.findUnique({
			where: { id },
			include: {
				user: {
					select: { id: true, pseudo: true, avatar: true },
				},
				eventCategory: true,
				confirmations: true,
				resolutions: true,
			},
		});

		if (!event) {
			throw new NotFoundException(`Événement avec l'ID #${id} introuvable`);
		}

		return event;
	}

	async update(id: string, updateEventDto: UpdateEventDto) {
		await this.findOne(id);
		return this.db.event.update({
			where: { id },
			data: updateEventDto,
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.db.event.delete({
			where: { id },
		});
	}
}
