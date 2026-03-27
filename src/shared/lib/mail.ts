import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

// inquiryType에 따라 분기되는 이메일 데이터 구조
interface ContactEmailData {
  inquiryType: "cleaning" | "moving";
  name: string;
  phone: string;
  serviceType: string;
  region?: string; // 청소의뢰 전용
  departure?: string; // 이사의뢰 전용 — 출발지
  destination?: string; // 이사의뢰 전용 — 도착지
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
 * 청소의뢰 HTML 본문 생성 — 지역 필드 포함
 */
function buildCleaningHtml(data: ContactEmailData): string {
  return `
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
              <div class="value">${escapeHtml(data.region ?? "")}</div>
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
}

/**
 * 이사의뢰 HTML 본문 생성 — 출발지/도착지 필드 포함
 */
function buildMovingHtml(data: ContactEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; }
          .badge { display: inline-block; background-color: #334155; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; margin-top: 8px; }
          .content { background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #475569; margin-bottom: 5px; }
          .value { background-color: white; padding: 10px; border-left: 3px solid #0f172a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>청소클라쓰 이사 견적 문의</h1>
            <div class="badge">이사의뢰</div>
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
              <div class="label">서비스 유형</div>
              <div class="value">${escapeHtml(data.serviceType)}</div>
            </div>
            <div class="field">
              <div class="label">출발지</div>
              <div class="value">${escapeHtml(data.departure ?? "미입력")}</div>
            </div>
            <div class="field">
              <div class="label">도착지</div>
              <div class="value">${escapeHtml(data.destination ?? "미입력")}</div>
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
}

/**
 * 견적문의 이메일 발송
 * inquiryType에 따라 제목과 본문 포맷을 분기:
 * - cleaning: 기존 청소의뢰 포맷 (지역 표시)
 * - moving: 이사의뢰 포맷 (출발지/도착지 표시, 별도 제목)
 */
export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  if (!process.env.ADMIN_EMAIL) {
    throw new Error("ADMIN_EMAIL 환경변수가 설정되지 않았습니다");
  }
  const transporter = getTransporter();

  const isMoving = data.inquiryType === "moving";
  const subject = isMoving
    ? `[청소클라쓰] 새 이사 견적문의 - ${sanitizeHeader(data.name)}`
    : `[청소클라쓰] 새 견적문의 - ${sanitizeHeader(data.name)}`;

  const htmlContent = isMoving
    ? buildMovingHtml(data)
    : buildCleaningHtml(data);

  // 이사의뢰 일반 텍스트 — 출발지/도착지 포함
  const movingPlainText = `
[이사의뢰]
이름: ${data.name}
연락처: ${data.phone}
서비스 유형: ${data.serviceType}
출발지: ${data.departure ?? "미입력"}
도착지: ${data.destination ?? "미입력"}

문의 내용:
${data.message}
  `.trim();

  // 청소의뢰 일반 텍스트 — 지역 포함
  const cleaningPlainText = `
이름: ${data.name}
연락처: ${data.phone}
지역: ${data.region ?? ""}
서비스 유형: ${data.serviceType}

문의 내용:
${data.message}
  `.trim();

  await transporter.sendMail({
    from: `"청소클라쓰 견적문의" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject,
    html: htmlContent,
    text: isMoving ? movingPlainText : cleaningPlainText,
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
