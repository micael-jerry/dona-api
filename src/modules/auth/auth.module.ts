import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { HashingModule } from '../../common/hashing/hashing.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthUtil } from './auth.util';
import { MailerModule } from '../mailer/mailer.module';
import { AppAuthGuard } from './guards/app-auth.guard';

@Global()
@Module({
	imports: [HashingModule, PassportModule, MailerModule],
	controllers: [AuthController],
	providers: [AuthRepository, AuthService, AuthUtil, AppAuthGuard, LocalStrategy],
})
export class AuthModule {}
