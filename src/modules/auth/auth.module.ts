import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { HashingModule } from '../../common/hashing/hashing.module';

@Module({
	imports: [HashingModule],
	controllers: [AuthController],
	providers: [AuthRepository, AuthService],
})
export class AuthModule {}
