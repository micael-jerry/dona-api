import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { DbModule } from '../../db/db.module'; // Ajustez le chemin vers votre PrismaModule[cite: 1]

@Module({
	imports: [DbModule],
	controllers: [EventController],
	providers: [EventService],
	exports: [EventService],
})
export class EventModule {}
