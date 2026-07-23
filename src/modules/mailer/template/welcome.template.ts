import { User } from '../../../../prisma/generated/client';
import { APP_LOGO_URL } from '../../../common/constants/app-logo.constant';

export class WelcomeEmail {
	static getTemplate(createdUser: User) {
		const logoUrl = APP_LOGO_URL;

		return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Dona</title>
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
          .greeting h1 {
            font-size: 22px;
            font-weight: 700;
            color: #f1f5f9;
            margin: 0 0 4px;
          }
          .greeting p {
            font-size: 13px;
            color: #64748b;
            margin: 0;
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
          .info-box {
            background-color: #0f172a;
            border-radius: 10px;
            padding: 16px 20px;
            border: 1px solid #334155;
            margin: 20px 0;
          }
          .info-box .info-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 14px;
            border-bottom: 1px solid #1e293b;
          }
          .info-box .info-row:last-child {
            border-bottom: none;
          }
          .info-box .info-row .label {
            color: #64748b;
            font-weight: 600;
          }
          .info-box .info-row .value {
            color: #f1f5f9;
          }
          .features {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin: 20px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            color: #94a3b8;
          }
          .feature-item .icon {
            font-size: 18px;
            width: 28px;
            text-align: center;
          }
          .cta-btn {
            display: block;
            text-align: center;
            background: linear-gradient(135deg, #1d4ed8, #2563eb);
            color: #ffffff;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            padding: 14px 24px;
            border-radius: 10px;
            margin-top: 28px;
            letter-spacing: 0.5px;
          }
          .footer {
            text-align: center;
            padding: 24px 0 0;
            font-size: 12px;
            color: #475569;
          }
          .footer a {
            color: #64748b;
            text-decoration: underline;
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
            <div class="greeting">
              <h1>Welcome, ${createdUser.name}!</h1>
              <p>Your Dona account is ready to go</p>
            </div>

            <hr class="divider">

            <div class="content">
              <p>
                You've just joined <strong style="color:#1d4ed8;">Dona</strong> — the community-driven platform for real-time road event signaling. Together, we make roads safer for everyone.
              </p>

              <div class="info-box">
                <div class="info-row">
                  <span class="label">Pseudo</span>
                  <span class="value">@${createdUser.pseudo}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email</span>
                  <span class="value">${createdUser.email}</span>
                </div>
              </div>

              <p>Here's what you can do on Dona:</p>
              <div class="features">
                <div class="feature-item"><span class="icon">📍</span> Report road events at your exact location</div>
                <div class="feature-item"><span class="icon">📊</span> Confirm events signaled by other drivers</div>
                <div class="feature-item"><span class="icon">⚡</span> React instantly — still there or resolved?</div>
                <div class="feature-item"><span class="icon">💬</span> Chat live with drivers near each incident</div>
                <div class="feature-item"><span class="icon">🗺️</span> Browse the live interactive map</div>
              </div>

              <p>If you have any questions, our team is here to help.</p>
              <p style="color:#94a3b8;">Stay safe on the road,<br><strong style="color:#fbbf24;">The Dona Team 🚦</strong></p>
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
