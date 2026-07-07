import {
	BadRequestException,
	Catch,
	ConflictException,
	ExceptionFilter,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
	catch(exception: Prisma.PrismaClientKnownRequestError) {
		switch (exception.code) {
			case 'P2025':
				// NotFoundError: Record not found
				throw new NotFoundException(`Resource not found.`);
			case 'P2002':
				// Unique constraint failed
				throw new ConflictException(`Unique constraint failed on the field(s).`);
			case 'P2016':
				// Query interpretation error
				throw new BadRequestException(`Query interpretation error`);
			case 'P2003':
				// Foreign key constraint failed
				throw new BadRequestException(`Foreign key constraint failed on the field.`);
			default:
				break;
		}
		throw new InternalServerErrorException(exception.message, {
			cause: exception.cause,
			description: `Prisma error code: ${exception.code}`,
		});
	}
}
