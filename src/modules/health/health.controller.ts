import { Controller, Get } from '@nestjs/common';
import { Ping } from './dto/ping.dto';

@Controller()
export class HealthController {
  @Get('ping')
  ping(): Ping {
    return { message: 'pong' };
  }
}
