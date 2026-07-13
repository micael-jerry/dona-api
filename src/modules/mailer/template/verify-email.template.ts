import { User } from '../../../../prisma/generated/client';

export class VerifyEmail {
	static getTemplate(createdUser: User, emailVerificationToken: string, uiUrl: string) {
		const logoUrl = `${uiUrl}/logo.png`;
		const verificationLink = `${uiUrl}/verify-email?token=${emailVerificationToken}`;

		return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email - Dona</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

          body {
            font-family: 'Inter', Arial, sans-serif;
            background-color: #0f172a;
            margin: 0;
            padding: 40px 16px;
          }
          .wrapper {
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 8px;
          }
          .header .logo-img {
            height: 56px;
            width: auto;
            object-fit: contain;
          }
          .header .tagline {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 6px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .card {
            background-color: #1e293b;
            border-radius: 16px;
            padding: 36px 32px;
            margin-top: 24px;
            border: 1px solid #334155;
          }
          .icon-row {
            text-align: center;
            margin-bottom: 20px;
          }
          .icon-row .shield {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f59e0b22, #ef444422);
            border: 2px solid #f59e0b;
            font-size: 28px;
          }
          .title {
            text-align: center;
            font-size: 22px;
            font-weight: 700;
            color: #f1f5f9;
            margin: 0 0 4px;
          }
          .subtitle {
            text-align: center;
            font-size: 13px;
            color: #64748b;
            margin: 0 0 24px;
          }
          .divider {
            border: none;
            border-top: 1px solid #334155;
            margin: 24px 0;
          }
          .content p {
            font-size: 15px;
            line-height: 1.7;
            color: #cbd5e1;
            margin: 0 0 16px;
          }
          .cta-btn {
            display: block;
            text-align: center;
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            color: #ffffff;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            padding: 14px 24px;
            border-radius: 10px;
            margin: 28px 0;
            letter-spacing: 0.5px;
          }
          .link-box {
            background-color: #0f172a;
            border-radius: 10px;
            padding: 12px 16px;
            border: 1px solid #334155;
            margin: 0 0 16px;
            word-break: break-all;
          }
          .link-box a {
            color: #f59e0b;
            font-size: 13px;
            text-decoration: none;
          }
          .warning {
            font-size: 13px;
            color: #64748b;
            margin: 0;
          }
          .footer {
            text-align: center;
            padding: 24px 0 0;
            font-size: 12px;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <img src="${logoUrl}" alt="Dona Logo" class="logo-img">
            <p class="tagline">Road Event Signaling Platform</p>
          </div>

          <div class="card">
            <div class="icon-row">
              <span class="shield">✉️</span>
            </div>
            <h1 class="title">Verify Your Email</h1>
            <p class="subtitle">Hello, ${createdUser.name} — one last step!</p>

            <hr class="divider">

            <div class="content">
              <p>
                Thanks for joining <strong style="color:#f59e0b;">Dona</strong>! To activate your account and start reporting road events, please confirm your email address by clicking the button below.
              </p>

              <a href="${verificationLink}" class="cta-btn">✅ Verify My Email</a>

              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <div class="link-box">
                <a href="${verificationLink}">${verificationLink}</a>
              </div>

              <p class="warning">⚠️ This link will expire in 24 hours. If you did not create a Dona account, you can safely ignore this email.</p>

              <p style="color:#94a3b8; margin-top: 24px;">Stay safe on the road,<br><strong style="color:#f59e0b;">The Dona Team 🚦</strong></p>
            </div>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Dona — Road Event Signaling Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
	}
}
