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
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthGoogleService } from './auth-google.service';
import { AuthGoogleController } from './auth-google.controller';
import { UserModule } from '../user/user.module';

@Global()
@Module({
	imports: [HashingModule, PassportModule, MailerModule, UserModule],
	controllers: [AuthController, AuthGoogleController],
	providers: [AuthRepository, AuthService, AuthUtil, AppAuthGuard, LocalStrategy, GoogleStrategy, AuthGoogleService],
	exports: [AuthUtil, AppAuthGuard],
})
export class AuthModule {}
