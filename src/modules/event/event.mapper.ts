import { DonaEventResponseDto } from './dto/response';
import { EventWithDetails } from './event.repository';

export class EventMapper {
	static toDto(event: EventWithDetails, currentUserId: string | null = null): DonaEventResponseDto {
		const confirmationsCount = event._count.confirmations;
		const resolutionsCount = event._count.resolutions;
		const isOwner = Boolean(currentUserId && event.userId === currentUserId);
		const hasUserConfirmed = Boolean(currentUserId && event.confirmations && event.confirmations.length > 0);
		const veracityScore = confirmationsCount >= 3 ? 100 : Math.round((confirmationsCount / 3) * 100);
		const isOfficialValidated = confirmationsCount >= 3;

		const authorCounts = event.user._count;
		const reputationScore =
			(authorCounts?.userConfirmEvents ?? 0) + (authorCounts?.userResolveEvents ?? 0) + (authorCounts?.events ?? 0);

		return {
			id: event.id,
			title: event.title,
			description: event.description,
			location: {
				lat: event.latitude,
				lng: event.longitude,
			},
			addressName: event.address,
			category: event.eventCategory?.value ? event.eventCategory.value.toLowerCase() : null,
			severity: event.severity,
			status: event.status ? event.status.toLowerCase() : null,
			veracityScore,
			confirmationsCount,
			resolutionsCount,
			isOfficialValidated,
			hasUserConfirmed,
			createdAt: event.createdAt,
			reportedBy: {
				isOwner,
				name: event.user.name ?? 'Unknown User',
				avatarUrl: event.user.avatar ?? `https://api.dicebear.com/10.x/avataaars-neutral/png?seed=${event.user.pseudo}`,
				reputationScore,
			},
			imageUrl: event.imageUrl,
		};
	}
}
