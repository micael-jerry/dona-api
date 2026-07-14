import { UserRole } from '../../../../prisma/generated/client';
import { AuthType } from '../types/auth.type';
import { AUTH_TYPE_METADATA_KEY } from '../constants/auth-type-metadata-key.constant';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../guards/app-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from './roles.decorator';

export const Auth = (type: AuthType, userRole: UserRole[] = []) => {
	const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
		SetMetadata(AUTH_TYPE_METADATA_KEY, type),
	];

	if (type === AuthType.ANONYMOUS || type === AuthType.PUBLIC || type === AuthType.AUTHENTICATED) {
		decorators.push(UseGuards(AppAuthGuard));
	} else if (type === AuthType.ROLE_BASED) {
		decorators.push(Roles(userRole), UseGuards(AppAuthGuard, RolesGuard));
	}

	return applyDecorators(...decorators);
};
