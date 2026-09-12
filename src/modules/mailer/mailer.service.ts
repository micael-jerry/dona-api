import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../../../prisma/generated/client';
import { NodeEnv } from '../../config/app';
import { MailObjectEntity } from './entity/mail-object.entity';
import { ResetPasswordEmail } from './template/reset-password.template';
import { VerifyEmail } from './template/verify-email.template';
import { WelcomeEmail } from './template/welcome.template';
import nodemailer, { SendMailOptions, SMTPSentMessageInfo, SMTPTransportOptions, type Mail } from 'nodemailer';

@Injectable()
export class MailerService {
	private readonly logger = new Logger(MailerService.name);
	private readonly uiUrl: string;
	private readonly nodeEnv: NodeEnv;
	private readonly transporter: SMTPTransportOptions;
	private readonly transport: Mail<SMTPSentMessageInfo>;

	constructor(private readonly configService: ConfigService) {
		this.uiUrl = this.configService.getOrThrow<string>('app.uiUrl');
		this.nodeEnv = this.configService.getOrThrow<NodeEnv>('app.env');
		this.transporter = {
			host: this.configService.getOrThrow<string>('app.smtp.host'),
			port: this.configService.getOrThrow<number>('app.smtp.port'),
			auth: {
				user: this.configService.getOrThrow<string>('app.smtp.auth.user'),
				pass: this.configService.getOrThrow<string>('app.smtp.auth.pass'),
			},
		};
		this.transport = nodemailer.createTransport(this.transporter);
	}

	/**
	 * Core method to send an email using the Resend service.
	 * Does not send emails in the 'TEST' environment.
	 *
	 * @param {MailObjectEntity} mailObject - The email object containing to, subject, and html content.
	 * @returns {Promise<void>}
	 * @private
	 */
	private sendEmail({ to, subject, html }: MailObjectEntity): void {
		// INFO: Not send email on test environment
		if (this.nodeEnv === NodeEnv.TEST) {
			return;
		}

		const sendMailOptions: SendMailOptions = {
			from: 'noreply@dona.app',
			to,
			subject,
			html,
		};

		this.transport.sendMail(sendMailOptions, (err, info) => {
			if (err) {
				this.logger.error(`ERROR TO SEND WELCOME EMAIL TO MAIL ${to.join(', ')}`, err);
			}
			this.logger.log(`WELCOME EMAIL SENDED TO ${to.join(', ')}`, info);
		});
	}

	/**
	 * Sends a welcome email to a newly created user.
	 *
	 * @param {User} createdUser - The newly registered user.
	 * @returns {Promise<void>}
	 */
	sendWelcomeEmail(createdUser: User): void {
		this.sendEmail({
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
	sendVerificationEmail(createdUser: User, emailVerificationToken: string): void {
		this.sendEmail({
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
	sendResetPasswordEmail(user: User, resetPasswordToken: string): void {
		this.sendEmail({
			to: [user.email],
			subject: 'Reset your password',
			html: ResetPasswordEmail.getTemplate(user, resetPasswordToken, this.uiUrl),
		});
	}
}
