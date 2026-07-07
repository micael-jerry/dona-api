import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './config/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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

	app.enableCors({
		origin: '*',
	});
	app.useGlobalPipes(validationPipe);
	app.useGlobalFilters(httpExceptionFilter);

	docBuilder(app, swaggerConfig);
	await app.listen(port);

	console.info(`API is running on: ${await app.getUrl()}`);
}

void run();
