import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { MailerService } from './../src/modules/mailer/mailer.service';

describe('AuthController (e2e)', () => {
	let app: INestApplication<App>;
	let authToken: string;

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
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('/auth/login (POST) - valid credentials', async () => {
		const response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: 'alice@dona.app',
				password: 'Alice@1234!',
			})
			.expect(HttpStatus.CREATED);

		const body = response.body as { token: string; user: { email: string } };
		expect(body).toHaveProperty('token');
		expect(body).toHaveProperty('user');
		expect(body.user.email).toBe('alice@dona.app');

		authToken = body.token;
	});

	it('/auth/login (POST) - invalid credentials', async () => {
		await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: 'alice@dona.app',
				password: 'wrongpassword',
			})
			.expect(HttpStatus.UNAUTHORIZED);
	});

	it('/auth/whoami (GET) - connected user', async () => {
		const response = await request(app.getHttpServer())
			.get('/auth/whoami')
			.set('Authorization', `Bearer ${authToken}`)
			.expect(HttpStatus.OK);

		const body = response.body as { id: string; email: string };
		expect(body).toHaveProperty('id');
		expect(body.email).toBe('alice@dona.app');
	});

	it('/auth/whoami (GET) - without token', async () => {
		await request(app.getHttpServer()).get('/auth/whoami').expect(HttpStatus.UNAUTHORIZED);
	});

	it('/auth/signup (POST) - create a new user', async () => {
		const response = await request(app.getHttpServer())
			.post('/auth/signup')
			.send({
				email: 'newuser@dona.app',
				pseudo: 'newuser',
				name: 'New User',
				password: 'NewUser@1234!',
			})
			.expect(HttpStatus.CREATED);

		const body = response.body as { id: string; email: string; pseudo: string };
		expect(body).toHaveProperty('id');
		expect(body.email).toBe('newuser@dona.app');
		expect(body.pseudo).toBe('newuser');
	});
});
