import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request } from 'express';
import { AuthType } from '../types/auth.type';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_METADATA_KEY } from '../constants/auth-type-metadata-key.constant';

@Injectable()
export class AppAuthGuard implements CanActivate {
	private readonly logger: Logger = new Logger(AppAuthGuard.name);

	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const authType: AuthType | undefined = this.extractAuthType(context);

		if (!authType) {
			throw new ForbiddenException('Access Denied');
		}

		const httpArgumentsHost: HttpArgumentsHost = context.switchToHttp();
		const req: Request = httpArgumentsHost.getRequest<Request>();
		const authHeader: string | undefined = req.headers.authorization;

		if ((authType === AuthType.ANONYMOUS && !authHeader) || authType === AuthType.PUBLIC) {
			return true;
		}

		return true;
	}

	private extractAuthType(context: ExecutionContext): AuthType | undefined {
		return this.reflector.get<AuthType>(AUTH_TYPE_METADATA_KEY, context.getHandler());
	}
}
