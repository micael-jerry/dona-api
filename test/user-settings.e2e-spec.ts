import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { MailerService } from '../src/modules/mailer/mailer.service';

describe('UserSettingsController (e2e)', () => {
	jest.setTimeout(30000);

	let app: INestApplication<App>;
	let aliceToken: string;

	const mockMailerService = {
		sendWelcomeEmail: jest.fn(),
		sendVerificationEmail: jest.fn(),
		sendResetPasswordEmail: jest.fn(),
	};

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(MailerService)
			.useValue(mockMailerService)
			.compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
		await app.init();

		// Login Alice (verified user from seed)
		const aliceLogin = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ email: 'alice@dona.app', password: 'Alice@1234!' });
		aliceToken = (aliceLogin.body as { token: string }).token;
	});

	afterAll(async () => {
		await app.close();
	});

	describe('GET /account/settings', () => {
		it('should reject request without bearer token', async () => {
			await request(app.getHttpServer()).get('/account/settings').expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return user settings for authenticated user', async () => {
			const response = await request(app.getHttpServer())
				.get('/account/settings')
				.set('Authorization', `Bearer ${aliceToken}`)
				.expect(HttpStatus.OK);

			const body = response.body as {
				id: string;
				userId: string;
				theme: string;
				language: string;
			};

			expect(body.id).toBeDefined();
			expect(body.userId).toBeDefined();
			expect(body.theme).toBeDefined();
			expect(body.language).toBeDefined();
		});
	});

	describe('PATCH /account/settings', () => {
		it('should reject request without bearer token', async () => {
			await request(app.getHttpServer())
				.patch('/account/settings')
				.send({ theme: 'DARK' })
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should reject invalid theme value', async () => {
			await request(app.getHttpServer())
				.patch('/account/settings')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({ theme: 'INVALID_THEME' })
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should reject invalid language value', async () => {
			await request(app.getHttpServer())
				.patch('/account/settings')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({ language: 'INVALID_LANG' })
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should update theme successfully', async () => {
			const response = await request(app.getHttpServer())
				.patch('/account/settings')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({ theme: 'DARK' })
				.expect(HttpStatus.OK);

			const body = response.body as { theme: string };
			expect(body.theme).toBe('DARK');
		});

		it('should update language successfully', async () => {
			const response = await request(app.getHttpServer())
				.patch('/account/settings')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({ language: 'EN' })
				.expect(HttpStatus.OK);

			const body = response.body as { language: string };
			expect(body.language).toBe('EN');
		});

		it('should update both theme and language simultaneously', async () => {
			const response = await request(app.getHttpServer())
				.patch('/account/settings')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({ theme: 'LIGHT', language: 'ES' })
				.expect(HttpStatus.OK);

			const body = response.body as { theme: string; language: string };
			expect(body.theme).toBe('LIGHT');
			expect(body.language).toBe('ES');
		});

		it('should persist settings when fetching GET /account/settings', async () => {
			const response = await request(app.getHttpServer())
				.get('/account/settings')
				.set('Authorization', `Bearer ${aliceToken}`)
				.expect(HttpStatus.OK);

			const body = response.body as { theme: string; language: string };
			expect(body.theme).toBe('LIGHT');
			expect(body.language).toBe('ES');
		});
	});
});
