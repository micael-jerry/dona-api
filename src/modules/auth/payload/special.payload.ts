import { UserRole } from '../../../../prisma/generated/client';

export class SpecialPayload {
	id!: string;
	email!: string;
	role!: UserRole;
}
