import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { SwaggerConfig } from './config/swagger';

function docBuilder(app: INestApplication, conf: SwaggerConfig) {
	const documentObject = new DocumentBuilder()
		.setTitle(conf.title)
		.setDescription(conf.description)
		.setVersion(conf.version)
		.addBearerAuth()
		.build();

	const document: OpenAPIObject = SwaggerModule.createDocument(app, documentObject, {
		operationIdFactory: (controllerKey: string, methodKey: string): string => methodKey,
	});
	SwaggerModule.setup('swagger', app, document, {
		jsonDocumentUrl: 'swagger/json',
	});
}

async function run() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const port: number = configService.getOrThrow<number>('app.port');
	const swaggerConfig: SwaggerConfig = configService.getOrThrow<SwaggerConfig>('swagger');

	const validationPipe: ValidationPipe = new ValidationPipe({
		transform: true,
		whitelist: true,
		forbidNonWhitelisted: true,
	});
	const httpExceptionFilter = new HttpExceptionFilter();
	const prismaExceptionFilter = new PrismaExceptionFilter();

	app.enableCors({
		origin: '*',
	});
	app.useGlobalPipes(validationPipe);
	app.useGlobalFilters(httpExceptionFilter);
	app.useGlobalFilters(prismaExceptionFilter);

	docBuilder(app, swaggerConfig);
	await app.listen(port);

	console.info(`API is running on: ${await app.getUrl()}`);
}

void run();
