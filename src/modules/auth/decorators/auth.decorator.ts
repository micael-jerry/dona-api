import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from '../../../../prisma/generated/client';
import { AUTH_TYPE_METADATA_KEY } from '../constants/auth-type-metadata-key.constant';
import { AppAuthGuard } from '../guards/app-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { AuthType } from '../types/auth.type';
import { Roles } from './roles.decorator';

/**
 * Centralized authentication decorator to secure endpoints.
 * Applies the appropriate metadata and guards based on the specified authentication type.
 *
 * @param {AuthType} type - The level of authentication required (e.g., PUBLIC, AUTHENTICATED, ROLE_BASED).
 * @param {UserRole[]} [userRole=[]] - An array of required roles if the type is ROLE_BASED.
 * @returns A composite decorator containing necessary Metadata and Guards.
 */
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
