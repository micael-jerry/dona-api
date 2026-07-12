import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from '../payload/user.payload';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): UserPayload => {
	const request = ctx.switchToHttp().getRequest<Request>();
	return request.user!;
});
