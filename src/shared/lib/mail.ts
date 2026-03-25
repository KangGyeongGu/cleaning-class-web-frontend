import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

/**
 * Gmail SMTP 이메일 전송 유틸리티
 */

interface ContactEmailData {
  name: string;
  phone: string;
  serviceType: string;
  region: string;
  message: string;
  images?: Array<{ filename: string; content: Buffer }>;
}

/**
 * SMTP 헤더 인젝션 방지 — 개행문자 제거
 */
function sanitizeHeader(str: string): string {
  return str.replace(/[\r\n]/g, " ");
}

/**
 * 첨부파일명 정규화 — 경로 구분자 및 헤더 인젝션 문자 제거
 */
function sanitizeFilename(name: string): string {
  const sanitized = name
    .replace(/[/\\:*?"<>|\r\n]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  return sanitized || "attachment";
}

/**
 * HTML 특수문자 이스케이프
 * XSS 방지를 위해 사용자 입력값을 HTML 엔티티로 변환
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 모듈 레벨 싱글턴 transporter (lazy initialization)
 * - 서버리스 환경에서 warm 인스턴스 내 SMTP 연결 재사용
 * - 환경 변수는 런타임 주입이므로 첫 호출 시점에 생성
 */
let cachedTransporter: Mail | null = null;

function getTransporter(): Mail {
  if (!cachedTransporter) {
    const port = Number(process.env.SMTP_PORT);
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      isNaN(port)
    ) {
      throw new Error("SMTP 환경변수가 설정되지 않았습니다");
    }
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return cachedTransporter;
}

/**
 * 견적문의 이메일 전송
 * @param data - 문의자 정보 및 메시지
 */
export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  // 수신 주소 미설정 시 조기 오류 — 메일 전송 시도 전에 차단
  if (!process.env.ADMIN_EMAIL) {
    throw new Error("ADMIN_EMAIL 환경변수가 설정되지 않았습니다");
  }
  const transporter = getTransporter();

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
              <div class="value">${escapeHtml(data.name)}</div>
            </div>
            <div class="field">
              <div class="label">연락처</div>
              <div class="value">${escapeHtml(data.phone)}</div>
            </div>
            <div class="field">
              <div class="label">지역</div>
              <div class="value">${escapeHtml(data.region)}</div>
            </div>
            <div class="field">
              <div class="label">서비스 유형</div>
              <div class="value">${escapeHtml(data.serviceType)}</div>
            </div>
            <div class="field">
              <div class="label">문의 내용</div>
              <div class="value">${escapeHtml(data.message).replace(/\n/g, "<br>")}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"청소클라쓰 견적문의" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `[청소클라쓰] 새 견적문의 - ${sanitizeHeader(data.name)}`,
    html: htmlContent,
    text: `
이름: ${data.name}
연락처: ${data.phone}
지역: ${data.region}
서비스 유형: ${data.serviceType}

문의 내용:
${data.message}
    `.trim(),
    ...(data.images && data.images.length > 0
      ? {
          attachments: data.images.map((img) => ({
            filename: sanitizeFilename(img.filename),
            content: img.content,
          })),
        }
      : {}),
  });
}
