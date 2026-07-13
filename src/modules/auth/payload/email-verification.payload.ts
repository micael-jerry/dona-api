import { UserRole } from '../../../../prisma/generated/client';

export class EmailVerificationPayload {
	id!: string;
	email!: string;
	role!: UserRole;
}
