import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { HttpExceptionResponse } from '../dto/http-exception-response.dto';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ApiCommonHttpErrorDecorator() {
	return applyDecorators(
		ApiBadRequestResponse({
			type: HttpExceptionResponse,
			example: {
				status: HttpStatus.BAD_REQUEST,
				type: 'BadRequestException',
				message: 'Invalid request parameters',
				timestamp: new Date(),
				path: '/example',
			},
			description: 'Bad Request - The request could not be understood or was missing required parameters.',
		}),
		ApiForbiddenResponse({
			type: HttpExceptionResponse,
			example: {
				status: HttpStatus.FORBIDDEN,
				type: 'ForbiddenException',
				message: 'Access to this resource is forbidden',
				timestamp: new Date(),
				path: '/example',
			},
			description: 'Forbidden - The server understood the request, but refuses to authorize it.',
		}),
		ApiNotFoundResponse({
			type: HttpExceptionResponse,
			example: {
				status: HttpStatus.NOT_FOUND,
				type: 'NotFoundException',
				message: 'Resource not found',
				timestamp: new Date(),
				path: '/example',
			},
			description: 'Not Found - The requested resource could not be found on the server.',
		}),
		ApiTooManyRequestsResponse({
			type: HttpExceptionResponse,
			example: {
				status: HttpStatus.TOO_MANY_REQUESTS,
				type: 'TooManyRequestsException',
				message: 'Too many requests, please try again later',
				timestamp: new Date(),
				path: '/example',
			},
			description: 'Too Many Requests - The user has sent too many requests in a given amount of time.',
		}),
		ApiInternalServerErrorResponse({
			type: HttpExceptionResponse,
			example: {
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				type: 'InternalServerErrorException',
				message: 'An unexpected error occurred',
				timestamp: new Date(),
				path: '/example',
			},
			description: 'Internal Server Error - An unexpected condition was encountered by the server.',
		}),
	);
}
