import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request } from 'express';
import { AuthType } from '../types/auth.type';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_METADATA_KEY } from '../constants/auth-type-metadata-key.constant';
import { UserPayload } from '../payload/user.payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwtService: JwtService,
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

		try {
			const token: string = authHeader.split(' ')[1];
			const user: UserPayload | undefined = await this.jwtService.verifyAsync<UserPayload>(token);
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
		return this.reflector.get<AuthType>(AUTH_TYPE_METADATA_KEY, context.getHandler());
	}
}
