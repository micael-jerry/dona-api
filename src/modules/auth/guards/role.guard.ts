import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UserRole } from '../../../../prisma/generated/browser';
import { Roles } from '../decorators/roles.decorator';
import { UserPayload } from '../payload/user.payload';

/**
 * Guard that checks if the authenticated user has the necessary roles
 * to access a specific route. Relies on the metadata set by the @Roles decorator.
 */
@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const httpArgumentsHost: HttpArgumentsHost = context.switchToHttp();
		const req: Request = httpArgumentsHost.getRequest<Request>();

		if (!req.user || !this.hasPermission(req.user, this.getRequiredRoles(context)))
			throw new ForbiddenException('You do not have the required permissions to access this resource.');

		return true;
	}

	private getRequiredRoles(context: ExecutionContext): UserRole[] | undefined {
		return this.reflector.get<UserRole[]>(Roles, context.getHandler());
	}

	private hasPermission(payload: UserPayload, requiredRoles: UserRole[] | undefined): boolean {
		if (!requiredRoles) return true;
		return requiredRoles.includes(payload.role);
	}
}
