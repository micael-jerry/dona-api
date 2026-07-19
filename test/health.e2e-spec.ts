import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('HealthController (e2e)', () => {
	let app: INestApplication<App>;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('/ping (GET)', async () => {
		const response = await request(app.getHttpServer()).get('/ping?message=test-message').expect(HttpStatus.OK);

		const body = response.body as { message: string };
		expect(body).toHaveProperty('message');
		expect(body.message).toBe('test-message');
	});
});
