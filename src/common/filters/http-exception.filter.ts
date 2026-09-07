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
			message: exception.message,
			timestamp: new Date(),
			path: request.url,
		};

		response.status(status).json(exceptionResponse);
	}
}
