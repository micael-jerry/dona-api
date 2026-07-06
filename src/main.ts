import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './config/swagger';

function docBuilder(app: INestApplication, conf: SwaggerConfig) {
	const documentObject = new DocumentBuilder()
		.setTitle(conf.title)
		.setDescription(conf.description)
		.setVersion(conf.version)
		.addBearerAuth()
		.build();

	const document: OpenAPIObject = SwaggerModule.createDocument(app, documentObject, {
		operationIdFactory: (_: string, methodKey: string): string => methodKey,
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

	app.enableCors({
		origin: '*',
	});

	await app.listen(port);
	docBuilder(app, swaggerConfig);

	console.info(`API is running on: ${await app.getUrl()}`);
}

void run();
