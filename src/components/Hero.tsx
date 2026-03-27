import Image from "next/image";
import { getSiteConfig } from "@/shared/lib/site-config";
import { getHeroImageUrl } from "@/shared/lib/supabase/storage";
import { HeroCTA } from "@/components/HeroCTA";

export async function Hero(): Promise<React.JSX.Element> {
  const siteConfig = await getSiteConfig();

  const displayName = siteConfig?.business_name ?? "청소클라쓰";
  const description = siteConfig?.description ?? undefined;
  const phone = siteConfig?.phone;
  const movingPhone = siteConfig?.moving_phone;

  // 히어로 배경이미지 URL 생성 (최대 2장)
  const heroImage1 = siteConfig?.hero_image_path
    ? getHeroImageUrl(siteConfig.hero_image_path)
    : "";
  const heroImage2 = siteConfig?.hero_image_path_2
    ? getHeroImageUrl(siteConfig.hero_image_path_2)
    : "";

  const focal1 = {
    x: siteConfig?.hero_image_focal_x ?? 50,
    y: siteConfig?.hero_image_focal_y ?? 50,
  };
  const focal2 = {
    x: siteConfig?.hero_image_focal_x_2 ?? 50,
    y: siteConfig?.hero_image_focal_y_2 ?? 50,
  };

  const hasImage1 = heroImage1 !== "";
  const hasImage2 = heroImage2 !== "";
  const hasAnyImage = hasImage1 || hasImage2;

  return (
    <section
      className={[
        "relative flex min-h-[50vh] w-full flex-col items-center justify-center overflow-hidden py-16 md:py-20",
        hasAnyImage ? "bg-slate-900 text-white" : "bg-white text-slate-900",
      ].join(" ")}
    >
      {hasAnyImage ? (
        <>
          {/* 배경이미지 레이어 — 2장이면 대각선 경계로 분할, 1장이면 전체
               각 컨테이너 60% 너비, 20% 겹침. clip-path 꼭짓점이 부모 기준 55%/45%에서 일치 */}
          <div className="absolute inset-0">
            {hasImage1 && (
              <div
                className="absolute top-0 bottom-0 left-0 overflow-hidden"
                style={{
                  ...(hasImage2
                    ? {
                        width: "60%",
                        clipPath: "polygon(0 0, 91.67% 0, 75% 100%, 0 100%)",
                      }
                    : { width: "100%" }),
                  animation: hasImage2
                    ? "heroImageSlideLeft 1.4s cubic-bezier(0.16,1,0.3,1) both"
                    : "heroImageReveal 1.6s cubic-bezier(0.16,1,0.3,1) both",
                }}
              >
                <Image
                  src={heroImage1}
                  fill
                  priority
                  alt=""
                  className="object-cover"
                  style={{ objectPosition: `${focal1.x}% ${focal1.y}%` }}
                  sizes={hasImage2 ? "60vw" : "100vw"}
                />
              </div>
            )}
            {hasImage2 && (
              <div
                className="absolute top-0 right-0 bottom-0 overflow-hidden"
                style={{
                  ...(hasImage1
                    ? {
                        width: "60%",
                        clipPath:
                          "polygon(25% 0, 100% 0, 100% 100%, 8.33% 100%)",
                      }
                    : { width: "100%" }),
                  animation: hasImage1
                    ? "heroImageSlideRight 1.4s 0.15s cubic-bezier(0.16,1,0.3,1) both"
                    : "heroImageReveal 1.6s cubic-bezier(0.16,1,0.3,1) both",
                }}
              >
                <Image
                  src={heroImage2}
                  fill
                  alt=""
                  className="object-cover"
                  style={{ objectPosition: `${focal2.x}% ${focal2.y}%` }}
                  sizes={hasImage1 ? "60vw" : "100vw"}
                />
              </div>
            )}
          </div>

          {/* 반투명 오버레이 — 이미지 등장 완료 후 서서히 어두워짐 */}
          <div
            className="absolute inset-0 bg-slate-900/55"
            style={{ animation: "heroOverlayFade 0.8s 1.2s ease-out both" }}
            aria-hidden="true"
          />
        </>
      ) : (
        <>
          {/* 이미지 없을 때 폴백 */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-white opacity-5"
            aria-hidden="true"
          />
          <div
            className="absolute top-1/4 right-1/4 hidden h-64 w-64 animate-[floatUp_6s_ease-in-out_infinite] rounded-full bg-gradient-to-b from-slate-50 to-white opacity-60 md:block md:blur-2xl"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-1/3 left-1/4 hidden h-48 w-48 animate-[floatDown_7s_1s_ease-in-out_infinite] rounded-full bg-gradient-to-t from-slate-50 to-white opacity-60 md:block md:blur-2xl"
            aria-hidden="true"
          />
        </>
      )}

      {/* 텍스트 콘텐츠 — 이미지 있을 때는 오버레이 완료 후 한번에 등장 */}
      <div
        className="relative z-10 mx-auto max-w-5xl px-4 text-center md:px-8 lg:px-12"
        style={
          hasAnyImage
            ? {
                animation:
                  "fadeInScale 0.8s 2s cubic-bezier(0.16,1,0.3,1) both",
              }
            : undefined
        }
      >
        <p
          className={[
            "text-label mb-6 tracking-widest",
            hasAnyImage ? "text-white/70" : "text-slate-400",
          ].join(" ")}
          style={
            !hasAnyImage
              ? { animation: "fadeIn 0.6s cubic-bezier(0.16,1,0.3,1) both" }
              : undefined
          }
        >
          전문 청소 서비스
        </p>

        <h1
          className={[
            "text-display mb-6",
            hasAnyImage ? "text-white" : "",
          ].join(" ")}
          style={
            !hasAnyImage
              ? { animation: "slideUp 1s cubic-bezier(0.16,1,0.3,1) both" }
              : undefined
          }
        >
          {displayName}.
        </h1>

        <p
          className={[
            "text-subtitle mb-12",
            hasAnyImage ? "font-light text-white/85" : "",
          ].join(" ")}
          style={
            !hasAnyImage
              ? { animation: "slideUp 1s 0.3s cubic-bezier(0.16,1,0.3,1) both" }
              : undefined
          }
        >
          {description ?? "완벽함을 넘어선 쾌적함을 선사합니다."}
        </p>

        <HeroCTA
          phone={phone}
          movingPhone={movingPhone}
          variant={hasAnyImage ? "dark" : "light"}
        />
      </div>
    </section>
  );
}
