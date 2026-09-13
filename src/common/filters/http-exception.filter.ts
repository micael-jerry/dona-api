import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpExceptionResponse } from '../dto/http-exception-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const status = exception.getStatus();
		const exceptionResponse: HttpExceptionResponse = {
			status: status,
			type: exception.name,
			message: this.extractExceptionMessage(exception),
			timestamp: new Date(),
			path: request.url,
		};

		response.status(status).json(exceptionResponse);
	}

	private extractExceptionMessage(exception: HttpException): string[] {
		const res: unknown = exception.getResponse();

		if (res !== null && typeof res === 'object' && 'message' in res) {
			const msg = (res as Record<string, unknown>).message;
			if (Array.isArray(msg)) return msg as string[];
			if (typeof msg === 'string') return [msg];
		}
		return [exception.message];
	}
}
