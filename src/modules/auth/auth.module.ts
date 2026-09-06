import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HashingModule } from '../../common/hashing/hashing.module';
import { MailerModule } from '../mailer/mailer.module';
import { UserModule } from '../user/user.module';
import { AuthGoogleController } from './auth-google.controller';
import { AuthGoogleService } from './auth-google.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthUtil } from './auth.util';
import { AppAuthGuard } from './guards/app-auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Global()
@Module({
	imports: [HashingModule, PassportModule, MailerModule, UserModule],
	controllers: [AuthController, AuthGoogleController],
	providers: [AuthRepository, AuthService, AuthUtil, AppAuthGuard, LocalStrategy, GoogleStrategy, AuthGoogleService],
	exports: [AuthUtil, AppAuthGuard],
})
export class AuthModule {}
