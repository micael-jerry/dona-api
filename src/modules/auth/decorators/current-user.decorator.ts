import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom decorator to extract the currently authenticated user from the request object.
 * Useful for injecting the user payload directly into controller method parameters.
 */
export const CurrentUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<Request>();
	const user = request.user;

	if (!user) {
		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return data ? user[data] : user;
});
