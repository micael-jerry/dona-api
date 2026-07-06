import { Controller, Get, HttpStatus } from '@nestjs/common';
import { Ping } from './dto/ping.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class HealthController {
	@ApiOperation({
		summary: 'Health check endpoint',
		description: 'Returns a simple message to verify the service is running.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Ping,
		description: 'Service is running',
	})
	@Get('ping')
	ping(): Ping {
		return { message: 'pong' };
	}
}
