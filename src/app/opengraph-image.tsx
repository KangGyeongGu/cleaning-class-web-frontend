import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "청소클라쓰 — 전북 지역 전문 청소 서비스";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: "#f8fafc",
          marginBottom: 24,
        }}
      >
        청소클라쓰
      </div>
      <div style={{ fontSize: 32, color: "#94a3b8", textAlign: "center" }}>
        공간의 본질을 되찾는 시간
      </div>
      <div style={{ fontSize: 24, color: "#64748b", marginTop: 16 }}>
        전북 지역 전문 청소 서비스
      </div>
    </div>,
    { ...size },
  );
}
