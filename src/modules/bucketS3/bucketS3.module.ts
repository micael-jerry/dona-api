import { Module } from '@nestjs/common';
import { BucketS3Service } from './bucketS3.service';

@Module({
	providers: [BucketS3Service],
	exports: [BucketS3Service],
})
export class BucketS3Module {}
