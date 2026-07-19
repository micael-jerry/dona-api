import { UserRole } from '../../../../prisma/generated/client';

export enum SpecialTokenPurpose {
	VERIFY_EMAIL = 'verify-email',
	RESET_PASSWORD = 'reset-password',
}

export class SpecialPayload {
	jti!: string;
	id!: string;
	email!: string;
	role!: UserRole;
	purpose!: SpecialTokenPurpose;
}
