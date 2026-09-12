export interface RawEventResult {
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

export interface EventLocation {
	lat: number;
	lng: number;
}

export interface EventReportedBy {
	isOwner: boolean;
	name: string;
	avatarUrl: string;
	reputationScore: number;
}

export interface DonaEvent {
	id: string;
	title: string;
	description: string;
	location: EventLocation;
	addressName: string;
	category: string | null;
	severity: string;
	status: string | null;
	veracityScore: number;
	confirmationsCount: number;
	resolutionsCount: number;
	isOfficialValidated: boolean;
	hasUserConfirmed: boolean;
	createdAt: Date;
	reportedBy: EventReportedBy;
	imageUrl: string;
}
