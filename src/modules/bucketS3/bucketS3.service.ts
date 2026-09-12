import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { FileUploadPayload } from './payload/file-upload.payload';

@Injectable()
export class BucketS3Service {
	private readonly logger = new Logger(BucketS3Service.name);
	private readonly bucketName: string;
	private readonly bucketRegion: string;
	private readonly endpoint: string;
	private readonly s3Client: S3Client;

	constructor(private readonly configService: ConfigService) {
		this.bucketName = this.configService.getOrThrow<string>('app.bucketS3.name');
		this.bucketRegion = this.configService.getOrThrow<string>('app.bucketS3.region');
		this.endpoint = this.configService.getOrThrow<string>('app.bucketS3.endpoint');

		this.s3Client = new S3Client({
			forcePathStyle: true,
			region: this.bucketRegion,
			endpoint: this.endpoint,
			credentials: {
				accessKeyId: this.configService.getOrThrow<string>('app.bucketS3.accessKeyId'),
				secretAccessKey: this.configService.getOrThrow<string>('app.bucketS3.secretAccessKey'),
			},
		});
	}

	/**
	 * Uploads a file (Buffer or Express.Multer.File) to Supabase S3 bucket.
	 *
	 * @param {FileUploadPayload} file - File buffer, mimetype, and optional original name.
	 * @param {string} [folder='uploads'] - Target directory inside the bucket.
	 * @returns {Promise<string>} Direct public URL to access the uploaded file.
	 */
	async uploadFile(file: FileUploadPayload, folder = 'uploads'): Promise<string> {
		try {
			const fileExtension = file.originalname ? extname(file.originalname).toLowerCase() : '';
			const uniqueFileName = `${randomUUID()}${fileExtension}`;
			const sanitizedFolder = folder.replace(/^\/+|\/+$/g, '');
			const key = sanitizedFolder ? `${sanitizedFolder}/${uniqueFileName}` : uniqueFileName;

			const command = new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			});

			await this.s3Client.send(command);

			const publicUrl = this.getPublicUrl(key);
			this.logger.log(`File uploaded successfully to S3: ${key}`);
			return publicUrl;
		} catch (error) {
			this.logger.error('Failed to upload file to Supabase S3', error);
			throw new InternalServerErrorException('Failed to upload file to storage');
		}
	}

	/**
	 * Deletes a file from Supabase S3 storage given its Key or full Public URL.
	 *
	 * @param {string} fileUrlOrKey - Full URL or object Key of the file to delete.
	 */
	async deleteFile(fileUrlOrKey: string): Promise<void> {
		if (!fileUrlOrKey) return;

		try {
			const key = this.extractKeyFromUrlOrKey(fileUrlOrKey);
			if (!key) return;

			const command = new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});

			await this.s3Client.send(command);
			this.logger.log(`File deleted successfully from S3: ${key}`);
		} catch (error) {
			this.logger.warn(`Failed to delete file from Supabase S3: ${fileUrlOrKey}`, error);
		}
	}

	/**
	 * Constructs the direct public URL for a given object key in Supabase Storage.
	 *
	 * @param {string} key - Object key inside the bucket.
	 * @returns {string} Public URL.
	 */
	getPublicUrl(key: string): string {
		const sanitizedKey = key.replace(/^\/+/g, '');
		const cleanEndpoint = this.endpoint.replace(/\/s3\/?$/, '').replace(/\/+$/, '');
		return `${cleanEndpoint}/object/public/${this.bucketName}/${sanitizedKey}`;
	}

	/**
	 * Helper method to extract the object key from a full public URL or return key directly.
	 */
	private extractKeyFromUrlOrKey(fileUrlOrKey: string): string {
		const publicPrefix = `/object/public/${this.bucketName}/`;
		const prefixIndex = fileUrlOrKey.indexOf(publicPrefix);

		if (prefixIndex !== -1) {
			return fileUrlOrKey.substring(prefixIndex + publicPrefix.length);
		}

		return fileUrlOrKey.replace(/^\/+/g, '');
	}
}
