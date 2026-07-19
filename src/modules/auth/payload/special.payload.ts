import { UserRole } from '../../../../prisma/generated/client';

export enum SpecialTokenPurpose {
	VERIFY_EMAIL = 'verify-email',
	RESET_PASSWORD = 'reset-password',
}

export class SpecialPayload {
	id!: string;
	email!: string;
	role!: UserRole;
	purpose!: SpecialTokenPurpose;
}
