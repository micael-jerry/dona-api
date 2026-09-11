import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DonaEvent } from './types/event.type';

interface RawEventResult {
	id: string;
	title: string;
	description: string;
	latitude: number | string;
	longitude: number | string;
	address: string;
	category: string | null;
	veracityScore: number | string;
	severity: string;
	status: string | null;
	createdAt: Date;
	confirmationsCount: number | string;
	resolutionsCount: number | string;
	isOfficialValidated: boolean;
	isOwner: boolean;
	ownerName: string | null;
	ownerAvatarUrl: string | null;
	reputationScore: number | string;
	imageUrl: string | null;
}

@Injectable()
export class EventService {
	constructor(private readonly db: DbService) {}

	private mapToDonaEvent(e: RawEventResult): DonaEvent {
		return {
			id: e.id,
			title: e.title,
			description: e.description,
			location: {
				lat: Number(e.latitude),
				lng: Number(e.longitude),
			},
			addressName: e.address,
			category: e.category ? e.category.toLowerCase() : null,
			severity: e.severity,
			status: e.status ? e.status.toLowerCase() : null,
			veracityScore: Number(e.veracityScore),
			confirmationsCount: Number(e.confirmationsCount),
			resolutionsCount: Number(e.resolutionsCount),
			isOfficialValidated: e.isOfficialValidated,
			createdAt: e.createdAt,
			reportedBy: {
				isOwner: e.isOwner,
				name: e.ownerName ?? 'Utilisateur inconnu',
				avatarUrl:
					e.ownerAvatarUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
				reputationScore: Number(e.reputationScore),
			},
			imageUrl: e.imageUrl ?? 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop',
		};
	}

	async create(userId: string, createEventDto: CreateEventDto): Promise<DonaEvent> {
		const event = await this.db.event.create({
			data: {
				...createEventDto,
				userId,
			},
		});

		return this.findOnePersonalized(userId, event.id);
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

	async findAllPersonalized(userId: string | null = null): Promise<DonaEvent[]> {
		const data: RawEventResult[] = await this.db.$queryRaw<RawEventResult[]>`
      WITH
        event_confirmations_count AS (
          SELECT "eventId", COUNT(*) AS quantity FROM user_confirm_events GROUP BY "eventId"
        ),
        event_resolutions_count AS (
          SELECT "eventId", COUNT(*) AS quantity FROM user_resolve_events GROUP BY "eventId"
        ),
        user_confirmations_count AS (
          SELECT "userId", COUNT(*) AS quantity FROM user_confirm_events GROUP BY "userId"
        ),
        user_resolutions_count AS (
          SELECT "userId", COUNT(*) AS quantity FROM user_resolve_events GROUP BY "userId"
        ),
        user_event_count AS (
          SELECT "userId", COUNT(*) AS quantity FROM events e LEFT JOIN "User" u ON u.id = e."userId" GROUP BY "userId"
        )
      SELECT
        e.id, e.title, e.description, e.latitude, e.longitude, e.address,
        ec.value AS category,
        CASE WHEN COALESCE(ecc.quantity::DECIMAL, 0) > 3 THEN 100 ELSE (COALESCE(ecc.quantity::DECIMAL, 0) / 3) * 100 END AS "veracityScore",
        e.severity, e.status, e."createdAt",
        COALESCE(ecc.quantity::DECIMAL, 0) AS "confirmationsCount",
        COALESCE(erc.quantity::DECIMAL, 0) AS "resolutionsCount",
        CASE WHEN COALESCE(ecc.quantity::DECIMAL, 0) >= 3 THEN TRUE ELSE FALSE END AS "isOfficialValidated",
        CASE WHEN u.id = ${userId} THEN TRUE ELSE FALSE END AS "isOwner",
        u.name AS "ownerName",
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop' AS "ownerAvatarUrl",
        COALESCE(ucc.quantity::DECIMAL, 0) + COALESCE(urc.quantity::DECIMAL, 0) + COALESCE(uec.quantity::DECIMAL, 0) AS "reputationScore",
        'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop' AS "imageUrl"
      FROM events e
        LEFT JOIN "User" u ON u.id = e."userId"
        LEFT JOIN event_categories ec ON ec.id = e."eventCategoryId"
        LEFT JOIN event_confirmations_count ecc ON ecc."eventId" = e.id
        LEFT JOIN event_resolutions_count erc ON erc."eventId" = e.id
        LEFT JOIN user_confirmations_count ucc ON ucc."userId" = u.id
        LEFT JOIN user_resolutions_count urc ON urc."userId" = u.id
        LEFT JOIN user_event_count uec ON uec."userId" = u.id
    `;

		return data.map((e: RawEventResult): DonaEvent => this.mapToDonaEvent(e));
	}

	async findOnePersonalized(userId: string | null = null, eventId: string): Promise<DonaEvent> {
		const data: RawEventResult[] = await this.db.$queryRaw<RawEventResult[]>`
      WITH
        event_confirmations_count AS (
          SELECT "eventId", COUNT(*) AS quantity FROM user_confirm_events WHERE "eventId" = ${eventId} GROUP BY "eventId"
        ),
        event_resolutions_count AS (
          SELECT "eventId", COUNT(*) AS quantity FROM user_resolve_events WHERE "eventId" = ${eventId} GROUP BY "eventId"
        ),
        user_confirmations_count AS (
          SELECT "userId", COUNT(*) AS quantity FROM user_confirm_events GROUP BY "userId"
        ),
        user_resolutions_count AS (
          SELECT "userId", COUNT(*) AS quantity FROM user_resolve_events GROUP BY "userId"
        ),
        user_event_count AS (
          SELECT "userId", COUNT(*) AS quantity FROM events e LEFT JOIN "User" u ON u.id = e."userId" GROUP BY "userId"
        )
      SELECT
        e.id, e.title, e.description, e.latitude, e.longitude, e.address,
        ec.value AS category,
        CASE WHEN COALESCE(ecc.quantity::DECIMAL, 0) > 3 THEN 100 ELSE (COALESCE(ecc.quantity::DECIMAL, 0) / 3) * 100 END AS "veracityScore",
        e.severity, e.status, e."createdAt",
        COALESCE(ecc.quantity::DECIMAL, 0) AS "confirmationsCount",
        COALESCE(erc.quantity::DECIMAL, 0) AS "resolutionsCount",
        CASE WHEN COALESCE(ecc.quantity::DECIMAL, 0) >= 3 THEN TRUE ELSE FALSE END AS "isOfficialValidated",
        CASE WHEN u.id = ${userId} THEN TRUE ELSE FALSE END AS "isOwner",
        u.name AS "ownerName",
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop' AS "ownerAvatarUrl",
        COALESCE(ucc.quantity::DECIMAL, 0) + COALESCE(urc.quantity::DECIMAL, 0) + COALESCE(uec.quantity::DECIMAL, 0) AS "reputationScore",
        'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop' AS "imageUrl"
      FROM events e
        LEFT JOIN "User" u ON u.id = e."userId"
        LEFT JOIN event_categories ec ON ec.id = e."eventCategoryId"
        LEFT JOIN event_confirmations_count ecc ON ecc."eventId" = e.id
        LEFT JOIN event_resolutions_count erc ON erc."eventId" = e.id
        LEFT JOIN user_confirmations_count ucc ON ucc."userId" = u.id
        LEFT JOIN user_resolutions_count urc ON urc."userId" = u.id
        LEFT JOIN user_event_count uec ON uec."userId" = u.id
      WHERE e.id = ${eventId}
    `;

		if (!data || data.length === 0) {
			throw new NotFoundException(`Événement avec l'ID #${eventId} introuvable`);
		}

		return this.mapToDonaEvent(data[0]);
	}

	async findOne(id: string) {
		const event = await this.db.event.findUnique({
			where: { id },
			include: {
				user: { select: { id: true, pseudo: true, avatar: true } },
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
