import { Module } from '@nestjs/common';
import { HashingModule } from '../../common/hashing/hashing.module';
import { BucketS3Module } from '../bucketS3/bucketS3.module';
import { MailerModule } from '../mailer/mailer.module';
import { AccountController } from './account.controller';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';

@Module({
	imports: [HashingModule, MailerModule, BucketS3Module],
	controllers: [AccountController],
	providers: [AccountRepository, AccountService],
	exports: [AccountService],
})
export class AccountModule {}
