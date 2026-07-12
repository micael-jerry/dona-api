import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { HashingModule } from '../../common/hashing/hashing.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthUtil } from './auth.util';

@Module({
	imports: [HashingModule, PassportModule],
	controllers: [AuthController],
	providers: [AuthRepository, AuthService, AuthUtil, LocalStrategy],
})
export class AuthModule {}
