import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from '../payload/user.payload';

/**
 * Custom decorator to extract the currently authenticated user from the request object.
 * Useful for injecting the user payload directly into controller method parameters.
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): UserPayload => {
	const request = ctx.switchToHttp().getRequest<Request>();
	return request.user!;
});
