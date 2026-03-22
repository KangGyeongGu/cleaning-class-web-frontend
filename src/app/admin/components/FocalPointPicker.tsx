"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface FocalPointPickerProps {
  imageUrl: string | null;
  focalX: number;
  focalY: number;
  onChange: (x: number, y: number) => void;
  label?: string;
}

const TARGET_RATIO = 3 / 4; // 3:4 세로

/**
 * imageUrl 변경 시 naturalSize 리셋이 필요합니다.
 * 부모 컴포넌트에서 key={imageUrl}을 전달하면 컴포넌트가 리마운트되어
 * naturalSize가 자동으로 null로 초기화됩니다.
 */
export function FocalPointPicker({
  imageUrl,
  focalX,
  focalY,
  onChange,
  label,
}: FocalPointPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef<{
    startMouseX: number;
    startMouseY: number;
    startFocalX: number;
    startFocalY: number;
  } | null>(null);

  // 이미지 로드 시 원본 크기 감지
  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    },
    [],
  );

  // 가이드 직사각형 크기 계산 (컨테이너 기준 비율)
  const getGuideRect = useCallback(() => {
    if (!naturalSize) return null;

    const imageRatio = naturalSize.w / naturalSize.h;

    let guideW: number; // 0~1 비율
    let guideH: number;

    if (imageRatio > TARGET_RATIO) {
      // 이미지가 더 넓음 → 세로 꽉참, 가로만 잘림
      guideH = 1;
      guideW = TARGET_RATIO / imageRatio;
    } else if (imageRatio < TARGET_RATIO) {
      // 이미지가 더 높음 → 가로 꽉참, 세로만 잘림
      guideW = 1;
      guideH = imageRatio / TARGET_RATIO;
    } else {
      // 정확히 3:4 → 잘림 없음
      return { x: 0, y: 0, w: 1, h: 1, canDragX: false, canDragY: false };
    }

    // focalX/Y (0~100) → 가이드 직사각형 위치 계산
    const maxOffsetX = 1 - guideW;
    const maxOffsetY = 1 - guideH;
    const x = (focalX / 100) * maxOffsetX;
    const y = (focalY / 100) * maxOffsetY;

    return {
      x,
      y,
      w: guideW,
      h: guideH,
      canDragX: maxOffsetX > 0.001,
      canDragY: maxOffsetY > 0.001,
    };
  }, [naturalSize, focalX, focalY]);

  // 드래그 핸들러
  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      dragStartRef.current = {
        startMouseX: clientX,
        startMouseY: clientY,
        startFocalX: focalX,
        startFocalY: focalY,
      };
      setDragging(true);
    },
    [focalX, focalY],
  );

  useEffect(() => {
    if (!dragging || !containerRef.current || !naturalSize) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const imageRatio = naturalSize.w / naturalSize.h;

    const canDragX = imageRatio > TARGET_RATIO;
    const canDragY = imageRatio < TARGET_RATIO;

    // 가이드 크기 비율
    const guideW = canDragX ? TARGET_RATIO / imageRatio : 1;
    const guideH = canDragY ? imageRatio / TARGET_RATIO : 1;
    const maxOffsetX = 1 - guideW;
    const maxOffsetY = 1 - guideH;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartRef.current.startMouseX;
      const deltaY = clientY - dragStartRef.current.startMouseY;

      let newFocalX = dragStartRef.current.startFocalX;
      let newFocalY = dragStartRef.current.startFocalY;

      if (canDragX && maxOffsetX > 0) {
        const deltaPercent = (deltaX / containerRect.width / maxOffsetX) * 100;
        newFocalX = Math.max(
          0,
          Math.min(
            100,
            Math.round(dragStartRef.current.startFocalX + deltaPercent),
          ),
        );
      }

      if (canDragY && maxOffsetY > 0) {
        const deltaPercent = (deltaY / containerRect.height / maxOffsetY) * 100;
        newFocalY = Math.max(
          0,
          Math.min(
            100,
            Math.round(dragStartRef.current.startFocalY + deltaPercent),
          ),
        );
      }

      onChange(newFocalX, newFocalY);
    };

    const handleUp = () => {
      setDragging(false);
      dragStartRef.current = null;
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleUp);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleUp);
    };
  }, [dragging, naturalSize, onChange]);

  if (!imageUrl) {
    return (
      <div className="w-full aspect-[3/4] max-w-xs border border-dashed border-slate-300 flex items-center justify-center">
        <p className="text-slate-400 text-xs text-center">
          이미지를 선택하면{"\n"}표시 영역을 지정할 수 있습니다
        </p>
      </div>
    );
  }

  const guide = getGuideRect();

  return (
    <div className="space-y-4">
      {label && (
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {label} 표시 영역 설정
        </p>
      )}

      {/* 원본 이미지 + 가이드 직사각형 */}
      <div
        ref={containerRef}
        className="relative max-w-xs select-none overflow-hidden"
        style={{ touchAction: "none" }}
      >
        <Image
          src={imageUrl}
          alt="표시 영역 설정"
          width={320}
          height={320}
          className="w-full h-auto block"
          sizes="320px"
          // unoptimized: 관리자 전용 미리보기 이미지로 blob URL 또는
          // 아직 최적화 파이프라인을 거치지 않은 원본을 표시해야 하므로
          // next/image 최적화를 비활성화합니다.
          unoptimized
          onLoad={handleImageLoad}
        />

        {guide && (guide.canDragX || guide.canDragY) && (
          <>
            {/* 어두운 오버레이 (가이드 영역 바깥) - 4면 분할 */}
            {/* 위 */}
            <div
              className="absolute left-0 right-0 top-0 bg-black/50 pointer-events-none"
              style={{ height: `${guide.y * 100}%` }}
            />
            {/* 아래 */}
            <div
              className="absolute left-0 right-0 bottom-0 bg-black/50 pointer-events-none"
              style={{ height: `${(1 - guide.y - guide.h) * 100}%` }}
            />
            {/* 왼쪽 */}
            <div
              className="absolute left-0 bg-black/50 pointer-events-none"
              style={{
                top: `${guide.y * 100}%`,
                height: `${guide.h * 100}%`,
                width: `${guide.x * 100}%`,
              }}
            />
            {/* 오른쪽 */}
            <div
              className="absolute right-0 bg-black/50 pointer-events-none"
              style={{
                top: `${guide.y * 100}%`,
                height: `${guide.h * 100}%`,
                width: `${(1 - guide.x - guide.w) * 100}%`,
              }}
            />

            {/* 가이드 직사각형 (드래그 영역) */}
            <div
              role="application"
              tabIndex={0}
              aria-label={`표시 영역 조정: ${guide.canDragX ? "좌우" : "상하"} 드래그로 위치 변경`}
              className="absolute border-2 border-white/80 shadow-lg"
              style={{
                left: `${guide.x * 100}%`,
                top: `${guide.y * 100}%`,
                width: `${guide.w * 100}%`,
                height: `${guide.h * 100}%`,
                cursor: dragging ? "grabbing" : "grab",
              }}
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
            >
              {/* 방향 힌트 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-white/70 text-xs font-bold drop-shadow-md">
                  {guide.canDragX ? "← 좌우 드래그 →" : "↑ 상하 드래그 ↓"}
                </p>
              </div>
            </div>
          </>
        )}

        {guide && !guide.canDragX && !guide.canDragY && naturalSize && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white/70 text-xs font-bold drop-shadow-md bg-black/30 px-2 py-1">
              3:4 비율 일치
            </p>
          </div>
        )}
      </div>

      {guide && (guide.canDragX || guide.canDragY) && (
        <p className="text-xs text-slate-400">
          표시 위치: {focalX}% {focalY}%
        </p>
      )}

      {/* aspect-[3/4] 미리보기 */}
      <div>
        <p className="text-xs text-slate-500 mb-2">실제 표시 미리보기 (3:4)</p>
        <div className="relative w-32 aspect-[3/4] overflow-hidden border border-slate-200 bg-slate-100">
          <Image
            src={imageUrl}
            alt="미리보기"
            fill
            sizes="128px"
            className="object-cover"
            style={{ objectPosition: `${focalX}% ${focalY}%` }}
            // unoptimized: 관리자 전용 미리보기 (blob URL 지원)
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
