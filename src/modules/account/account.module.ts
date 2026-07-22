import { Module } from '@nestjs/common';
import { HashingModule } from '../../common/hashing/hashing.module';
import { MailerModule } from '../mailer/mailer.module';
import { AccountController } from './account.controller';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';

@Module({
	imports: [HashingModule, MailerModule],
	controllers: [AccountController],
	providers: [AccountRepository, AccountService],
	exports: [AccountService],
})
export class AccountModule {}
