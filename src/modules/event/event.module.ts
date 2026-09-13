import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';

@Module({
	imports: [DbModule],
	controllers: [EventController],
	providers: [EventRepository, EventService],
	exports: [EventRepository, EventService],
})
export class EventModule {}
