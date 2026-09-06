import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthType } from '../auth/types/auth.type';
import { PingRequest } from './dto/ping-request.dto';
import { PingResponse } from './dto/ping-response.dto';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	@ApiOperation({
		summary: 'Health check endpoint',
		description: 'Returns a simple message to verify the service is running.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: PingResponse,
		description: 'Service is running',
	})
	@Get('ping')
	@Auth(AuthType.PUBLIC)
	ping(@Query() pingRequest: PingRequest): PingResponse {
		return this.healthService.handlePingRequest(pingRequest);
	}
}
