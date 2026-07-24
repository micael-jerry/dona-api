import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { User } from '../../../prisma/generated/client';
import { NodeEnv } from '../../config/app';
import { MailObjectEntity } from './entity/mail-object.entity';
import { ResetPasswordEmail } from './template/reset-password.template';
import { VerifyEmail } from './template/verify-email.template';
import { WelcomeEmail } from './template/welcome.template';

@Injectable()
export class MailerService {
	private readonly logger = new Logger(MailerService.name);
	private readonly resend: Resend;
	private readonly uiUrl: string;
	private readonly nodeEnv: NodeEnv;

	constructor(private readonly configService: ConfigService) {
		this.resend = new Resend(this.configService.getOrThrow<string>('app.resend.apiKey'));
		this.uiUrl = this.configService.getOrThrow<string>('app.uiUrl');
		this.nodeEnv = this.configService.getOrThrow<NodeEnv>('app.env');
	}

	/**
	 * Core method to send an email using the Resend service.
	 * Does not send emails in the 'TEST' environment.
	 *
	 * @param {MailObjectEntity} mailObject - The email object containing to, subject, and html content.
	 * @returns {Promise<void>}
	 * @private
	 */
	private async sendEmail({ to, subject, html }: MailObjectEntity): Promise<void> {
		// INFO: Not send email on test environment
		if (this.nodeEnv === NodeEnv.TEST) {
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
		}

		this.logger.log(`WELCOME EMAIL SENDED TO ${to.join(', ')}`, data);
	}

	/**
	 * Sends a welcome email to a newly created user.
	 *
	 * @param {User} createdUser - The newly registered user.
	 * @returns {Promise<void>}
	 */
	async sendWelcomeEmail(createdUser: User): Promise<void> {
		await this.sendEmail({
			to: [createdUser.email],
			subject: 'Welcome to Dona app',
			html: WelcomeEmail.getTemplate(createdUser),
		});
	}

	/**
	 * Sends an email with a token to verify the user's email address.
	 *
	 * @param {User} createdUser - The user needing verification.
	 * @param {string} emailVerificationToken - The verification token.
	 * @returns {Promise<void>}
	 */
	async sendVerificationEmail(createdUser: User, emailVerificationToken: string): Promise<void> {
		await this.sendEmail({
			to: [createdUser.email],
			subject: 'Verify your email',
			html: VerifyEmail.getTemplate(createdUser, emailVerificationToken, this.uiUrl),
		});
	}

	/**
	 * Sends a password reset email to a user with a reset token.
	 *
	 * @param {User} user - The user requesting the password reset.
	 * @param {string} resetPasswordToken - The password reset token.
	 * @returns {Promise<void>}
	 */
	async sendResetPasswordEmail(user: User, resetPasswordToken: string): Promise<void> {
		await this.sendEmail({
			to: [user.email],
			subject: 'Reset your password',
			html: ResetPasswordEmail.getTemplate(user, resetPasswordToken, this.uiUrl),
		});
	}
}
