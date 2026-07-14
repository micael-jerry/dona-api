import { UserRole } from '../../../../prisma/generated/client';
import { AuthType } from '../types/auth.type';
import { AUTH_TYPE_METADATA_KEY } from '../constants/auth-type-metadata-key.constant';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../guards/app-auth.guard';

export const Auth = (type: AuthType, userRole: UserRole[] = []) => {
	const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
		SetMetadata(AUTH_TYPE_METADATA_KEY, type),
	];

	if (type === AuthType.ANONYMOUS || type === AuthType.PUBLIC) {
		decorators.push(UseGuards(AppAuthGuard));
	}

	return applyDecorators(...decorators);
};
