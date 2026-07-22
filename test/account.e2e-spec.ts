import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { MailerService } from '../src/modules/mailer/mailer.service';

describe('AccountController (e2e)', () => {
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

	describe('GET /account/profile', () => {
		it('should reject request without bearer token', async () => {
			await request(app.getHttpServer()).get('/account/profile').expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return profile for authenticated user', async () => {
			const response = await request(app.getHttpServer())
				.get('/account/profile')
				.set('Authorization', `Bearer ${aliceToken}`)
				.expect(HttpStatus.OK);

			const body = response.body as { email: string; pseudo: string; isEmailVerified: boolean };
			expect(body.email).toBe('alice@dona.app');
			expect(body.pseudo).toBe('alice42');
			expect(body.isEmailVerified).toBe(true);
		});
	});

	describe('PATCH /account/profile', () => {
		it('should reject request without bearer token', async () => {
			await request(app.getHttpServer())
				.patch('/account/profile')
				.send({ name: 'New Name' })
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should reject invalid pseudo (too short)', async () => {
			await request(app.getHttpServer())
				.patch('/account/profile')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({ pseudo: 'ab' })
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should reject pseudo that is already taken by another user', async () => {
			await request(app.getHttpServer())
				.patch('/account/profile')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({ pseudo: 'bob42' })
				.expect(HttpStatus.CONFLICT);
		});

		it('should update profile with valid data', async () => {
			const response = await request(app.getHttpServer())
				.patch('/account/profile')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({
					name: 'Alice Martin Updated',
					pseudo: 'alice_updated',
				})
				.expect(HttpStatus.OK);

			const body = response.body as { name: string; pseudo: string };
			expect(body.name).toBe('Alice Martin Updated');
			expect(body.pseudo).toBe('alice_updated');

			// Restore pseudo back to original
			await request(app.getHttpServer())
				.patch('/account/profile')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({ pseudo: 'alice42' });
		});
	});

	describe('POST /account/request-email-verification', () => {
		let unverifiedToken: string;
		const unverifiedEmail = `unverified_${Date.now()}@dona.app`;
		const unverifiedPassword = 'UnverifiedPass@1234!';

		beforeAll(async () => {
			await request(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: unverifiedEmail,
					pseudo: `unverified_${Date.now()}`,
					name: 'Unverified User',
					password: unverifiedPassword,
				});

			const loginRes = await request(app.getHttpServer())
				.post('/auth/login')
				.send({ email: unverifiedEmail, password: unverifiedPassword });

			unverifiedToken = (loginRes.body as { token: string }).token;
		});

		it('should reject request without bearer token', async () => {
			await request(app.getHttpServer()).post('/account/request-email-verification').expect(HttpStatus.UNAUTHORIZED);
		});

		it('should reject if email is already verified', async () => {
			await request(app.getHttpServer())
				.post('/account/request-email-verification')
				.set('Authorization', `Bearer ${aliceToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should send email verification request when email is not verified', async () => {
			const response = await request(app.getHttpServer())
				.post('/account/request-email-verification')
				.set('Authorization', `Bearer ${unverifiedToken}`)
				.expect(HttpStatus.OK);

			const body = response.body as { message: string; email: string };
			expect(body.message).toBe('Verification email sent successfully');
			expect(body.email).toBe(unverifiedEmail);
			expect(mockMailerService.sendVerificationEmail).toHaveBeenCalled();
		});
	});

	describe('PATCH /account/change-password', () => {
		it('should reject request without bearer token', async () => {
			await request(app.getHttpServer())
				.patch('/account/change-password')
				.send({ currentPassword: 'Alice@1234!', newPassword: 'NewPassword@1234!' })
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should reject if current password is incorrect', async () => {
			await request(app.getHttpServer())
				.patch('/account/change-password')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({ currentPassword: 'WrongPassword123!', newPassword: 'NewPassword@1234!' })
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should change password successfully with correct current password', async () => {
			await request(app.getHttpServer())
				.patch('/account/change-password')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({
					currentPassword: 'Alice@1234!',
					newPassword: 'AliceNew@1234!',
				})
				.expect(HttpStatus.OK);

			// Re-login with new password
			const newLogin = await request(app.getHttpServer())
				.post('/auth/login')
				.send({ email: 'alice@dona.app', password: 'AliceNew@1234!' })
				.expect(HttpStatus.CREATED);

			const newAuthToken = (newLogin.body as { token: string }).token;

			// Revert password back to original
			await request(app.getHttpServer())
				.patch('/account/change-password')
				.set('Authorization', `Bearer ${newAuthToken}`)
				.send({
					currentPassword: 'AliceNew@1234!',
					newPassword: 'Alice@1234!',
				})
				.expect(HttpStatus.OK);
		});
	});

	describe('DELETE /account', () => {
		let deleteToken: string;
		const deleteEmail = `todelete_${Date.now()}@dona.app`;
		const deletePassword = 'ToDeletePass@1234!';

		beforeAll(async () => {
			await request(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: deleteEmail,
					pseudo: `todelete_${Date.now()}`,
					name: 'To Delete User',
					password: deletePassword,
				});

			const loginRes = await request(app.getHttpServer())
				.post('/auth/login')
				.send({ email: deleteEmail, password: deletePassword });

			deleteToken = (loginRes.body as { token: string }).token;
		});

		it('should reject request without bearer token', async () => {
			await request(app.getHttpServer()).delete('/account').expect(HttpStatus.UNAUTHORIZED);
		});

		it('should reject account deletion without password confirmation', async () => {
			await request(app.getHttpServer())
				.delete('/account')
				.set('Authorization', `Bearer ${deleteToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should delete account when valid password confirmation is provided', async () => {
			const response = await request(app.getHttpServer())
				.delete('/account')
				.set('Authorization', `Bearer ${deleteToken}`)
				.send({ password: deletePassword })
				.expect(HttpStatus.OK);

			const body = response.body as { message: string };
			expect(body.message).toBe('Account successfully deleted');

			// Login should now fail
			await request(app.getHttpServer())
				.post('/auth/login')
				.send({ email: deleteEmail, password: deletePassword })
				.expect(HttpStatus.UNAUTHORIZED);
		});
	});
});
