import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthUtil } from '../auth.util';
import { AUTH_TYPE_METADATA_KEY } from '../constants/auth-type-metadata-key.constant';
import { UserPayload } from '../payload/user.payload';
import { AuthType } from '../types/auth.type';

/**
 * Global authentication guard that verifies JWT tokens.
 * It checks the metadata set by the @Auth decorator and enforces access rules
 * (e.g., PUBLIC, ANONYMOUS, AUTHENTICATED).
 */
@Injectable()
export class AppAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly authUtil: AuthUtil,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const authType: AuthType | undefined = this.extractAuthType(context);

		if (!authType) {
			throw new ForbiddenException('Access Denied');
		}

		const httpArgumentsHost: HttpArgumentsHost = context.switchToHttp();
		const req: Request = httpArgumentsHost.getRequest<Request>();
		const authHeader: string | undefined = req.headers.authorization;

		if ((authType === AuthType.ANONYMOUS && !authHeader) || authType === AuthType.PUBLIC) {
			return true;
		} else if (authType === AuthType.ANONYMOUS && authHeader) {
			throw new UnauthorizedException('Access Denied, Anonymous access is not allowed with authorization header');
		} else if (!authHeader) {
			throw new UnauthorizedException('Access Denied, Authorization header is required');
		}

		const [type, token]: string[] = authHeader.split(' ');

		if (type.toLowerCase() !== 'bearer' || !token) {
			throw new UnauthorizedException('Access Denied, Invalid token format');
		}

		try {
			const user: UserPayload | undefined = await this.authUtil.verifyToken<UserPayload>(token);
			if (!user) {
				throw new UnauthorizedException('Access Denied, Invalid token');
			}

			req.user = user;
			return true;
		} catch {
			throw new UnauthorizedException('Access Denied, Invalid token');
		}
	}

	private extractAuthType(context: ExecutionContext): AuthType | undefined {
		return this.reflector.getAllAndOverride<AuthType>(AUTH_TYPE_METADATA_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
	}
}
