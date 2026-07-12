import { Injectable } from '@nestjs/common';
import { MailObjectEntity } from './entity/mail-object.entity';
import { ConfigService } from '@nestjs/config';
import { NodeEnv } from '../../config/app';
import { Resend } from 'resend';
import { Logger } from '@nestjs/common';
import { User } from '../../../prisma/generated/client';
import { WelcomeEmail } from './template/welcome.template';

@Injectable()
export class MailerService {
	private readonly logger = new Logger(MailerService.name);
	private readonly resend: Resend;

	constructor(private readonly configService: ConfigService) {
		this.resend = new Resend(this.configService.getOrThrow<string>('app.resend.apiKey'));
	}

	private async sendEmail({ to, subject, html }: MailObjectEntity): Promise<void> {
		// INFO: Not send email on test environment
		if (this.configService.getOrThrow<NodeEnv>('app.env') === NodeEnv.TEST) {
			return;
		}

		const { data, error } = await this.resend.emails.send({
			from: 'Dona app <no-reply@resend.dev>',
			to: to,
			subject: subject,
			html: html,
		});

		if (error) {
			this.logger.error(`ERROR TO SEND WELCOME EMAIL TO MAIL ${to.join(', ')}`, error);
			// TODO: VERIFY IF THE ERROR IS FROM RESEND OR FROM THE FRONTEND
			// throw new BadGatewayException('Failed to send the email via external service. Please try again later.');
		}

		this.logger.log(`WELCOME EMAIL SENDED TO ${to.join(', ')}`, data);
	}

	async sendWelcomeEmail(createdUser: User): Promise<void> {
		await this.sendEmail({
			to: [createdUser.email],
			subject: 'Welcome to Dona app',
			html: WelcomeEmail.getTemplate(createdUser),
		});
	}
}
