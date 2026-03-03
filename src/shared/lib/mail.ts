import nodemailer from "nodemailer";

/**
 * Gmail SMTP 이메일 전송 유틸리티
 */

interface ContactEmailData {
  name: string;
  phone: string;
  serviceType: string;
  message: string;
}

/**
 * 견적문의 이메일 전송
 * @param data - 문의자 정보 및 메시지
 */
export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // SSL 사용 (포트 465)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #475569; margin-bottom: 5px; }
          .value { background-color: white; padding: 10px; border-left: 3px solid #0f172a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>청소클라쓰 견적 문의</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">이름</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="field">
              <div class="label">연락처</div>
              <div class="value">${data.phone}</div>
            </div>
            <div class="field">
              <div class="label">서비스 유형</div>
              <div class="value">${data.serviceType}</div>
            </div>
            <div class="field">
              <div class="label">문의 내용</div>
              <div class="value">${data.message.replace(/\n/g, "<br>")}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"청소클라쓰 견적문의" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `[청소클라쓰] 새 견적문의 - ${data.name}`,
    html: htmlContent,
    text: `
이름: ${data.name}
연락처: ${data.phone}
서비스 유형: ${data.serviceType}

문의 내용:
${data.message}
    `.trim(),
  });
}
