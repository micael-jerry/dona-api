import { Injectable } from '@nestjs/common';
import { PingRequest } from './dto/ping-request.dto';
import { PingResponse } from './dto/ping-response.dto';

@Injectable()
export class HealthService {
	handlePingRequest({ message }: PingRequest): PingResponse {
		return { message: message! };
	}
}
