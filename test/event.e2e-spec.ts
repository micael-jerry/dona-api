import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DonaEventResponseDto } from '../src/modules/event/dto';
import { MailerService } from '../src/modules/mailer/mailer.service';

describe('EventController (e2e)', () => {
	jest.setTimeout(30000);

	let app: INestApplication<App>;
	let aliceToken: string;
	let bobToken: string;
	let createdEventId: string;

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

		// Log in Alice (verified user from seed)
		const aliceLogin = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ email: 'alice@dona.app', password: 'Alice@1234!' });
		aliceToken = (aliceLogin.body as { token: string }).token;

		// Log in Bob (verified user from seed)
		const bobLogin = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ email: 'bob@dona.app', password: 'Bob@1234!' });
		bobToken = (bobLogin.body as { token: string }).token;
	});

	afterAll(async () => {
		await app.close();
	});

	describe('POST /events', () => {
		it('should reject unauthenticated request', async () => {
			await request(app.getHttpServer())
				.post('/events')
				.send({
					eventCategoryId: 'cat_accident_01',
					title: 'Intersection Accident',
					description: 'Two vehicles involved',
					address: 'Station Avenue',
					latitude: -18.8792,
					longitude: 47.5079,
				})
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should reject invalid payload (missing title)', async () => {
			await request(app.getHttpServer())
				.post('/events')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({
					eventCategoryId: 'cat_accident_01',
					description: 'Two vehicles involved',
					address: 'Station Avenue',
					latitude: -18.8792,
					longitude: 47.5079,
				})
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should create an event and record author confirmation', async () => {
			const response = await request(app.getHttpServer())
				.post('/events')
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({
					eventCategoryId: 'cat_accident_01',
					title: 'Intersection Accident',
					description: 'Two vehicles involved',
					address: 'Station Avenue',
					latitude: -18.8792,
					longitude: 47.5079,
				})
				.expect(HttpStatus.CREATED);

			const event = response.body as DonaEventResponseDto;
			expect(event.id).toBeDefined();
			expect(event.title).toBe('Intersection Accident');
			expect(event.location.lat).toBe(-18.8792);
			expect(event.location.lng).toBe(47.5079);
			expect(event.reportedBy.isOwner).toBe(true);
			expect(event.hasUserConfirmed).toBe(true);
			expect(event.confirmationsCount).toBeGreaterThanOrEqual(1);

			createdEventId = event.id;
		});
	});

	describe('GET /events', () => {
		it('should allow public access for guests without token', async () => {
			const response = await request(app.getHttpServer()).get('/events').expect(HttpStatus.OK);

			const events = response.body as DonaEventResponseDto[];
			expect(Array.isArray(events)).toBe(true);
			const found = events.find((e) => e.id === createdEventId);
			expect(found).toBeDefined();
			expect(found?.reportedBy.isOwner).toBe(false);
			expect(found?.hasUserConfirmed).toBe(false);
		});

		it('should show isOwner and hasUserConfirmed when authenticated as creator', async () => {
			const response = await request(app.getHttpServer())
				.get('/events')
				.set('Authorization', `Bearer ${aliceToken}`)
				.expect(HttpStatus.OK);

			const events = response.body as DonaEventResponseDto[];
			const found = events.find((e) => e.id === createdEventId);
			expect(found).toBeDefined();
			expect(found?.reportedBy.isOwner).toBe(true);
			expect(found?.hasUserConfirmed).toBe(true);
		});
	});

	describe('POST /events/:id/confirm', () => {
		it('should reject confirmation without token', async () => {
			await request(app.getHttpServer()).post(`/events/${createdEventId}/confirm`).expect(HttpStatus.UNAUTHORIZED);
		});

		it('should reject creator confirming again', async () => {
			await request(app.getHttpServer())
				.post(`/events/${createdEventId}/confirm`)
				.set('Authorization', `Bearer ${aliceToken}`)
				.expect(HttpStatus.CONFLICT);
		});

		it('should allow Bob to confirm the event', async () => {
			const response = await request(app.getHttpServer())
				.post(`/events/${createdEventId}/confirm`)
				.set('Authorization', `Bearer ${bobToken}`)
				.expect(HttpStatus.OK);

			const event = response.body as DonaEventResponseDto;
			expect(event.id).toBe(createdEventId);
			expect(event.confirmationsCount).toBeGreaterThanOrEqual(2);
			expect(event.hasUserConfirmed).toBe(true);
			expect(event.reportedBy.isOwner).toBe(false);
		});

		it('should reject duplicate confirmation from Bob', async () => {
			await request(app.getHttpServer())
				.post(`/events/${createdEventId}/confirm`)
				.set('Authorization', `Bearer ${bobToken}`)
				.expect(HttpStatus.CONFLICT);
		});
	});

	describe('PATCH /events/:id', () => {
		it('should reject update without token', async () => {
			await request(app.getHttpServer())
				.patch(`/events/${createdEventId}`)
				.send({ title: 'Modified Title' })
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should forbid non-owner non-admin from updating', async () => {
			await request(app.getHttpServer())
				.patch(`/events/${createdEventId}`)
				.set('Authorization', `Bearer ${bobToken}`)
				.send({ title: 'Modified Title by Bob' })
				.expect(HttpStatus.FORBIDDEN);
		});

		it('should allow creator to update the event', async () => {
			const response = await request(app.getHttpServer())
				.patch(`/events/${createdEventId}`)
				.set('Authorization', `Bearer ${aliceToken}`)
				.send({ title: 'Major Intersection Accident' })
				.expect(HttpStatus.OK);

			const event = response.body as DonaEventResponseDto;
			expect(event.title).toBe('Major Intersection Accident');
		});
	});

	describe('DELETE /events/:id', () => {
		it('should reject delete without token', async () => {
			await request(app.getHttpServer()).delete(`/events/${createdEventId}`).expect(HttpStatus.UNAUTHORIZED);
		});

		it('should forbid non-owner non-admin from deleting', async () => {
			await request(app.getHttpServer())
				.delete(`/events/${createdEventId}`)
				.set('Authorization', `Bearer ${bobToken}`)
				.expect(HttpStatus.FORBIDDEN);
		});

		it('should allow creator to delete the event', async () => {
			await request(app.getHttpServer())
				.delete(`/events/${createdEventId}`)
				.set('Authorization', `Bearer ${aliceToken}`)
				.expect(HttpStatus.OK);

			await request(app.getHttpServer()).get(`/events/${createdEventId}`).expect(HttpStatus.NOT_FOUND);
		});
	});
});
