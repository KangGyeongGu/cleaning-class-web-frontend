"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/shared/actions/service";
import { Loader2, Plus } from "lucide-react";
import { FocalPointPicker } from "@/app/admin/components/FocalPointPicker";

interface NewServiceFormProps {
  defaultSortOrder?: number;
}

export function NewServiceForm({ defaultSortOrder = 0 }: NewServiceFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createService, null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(
    null,
  );
  const [focalX, setFocalX] = useState(50);
  const [focalY, setFocalY] = useState(50);
  const [afterFocalX, setAfterFocalX] = useState(50);
  const [afterFocalY, setAfterFocalY] = useState(50);

  // blob URL 메모리 누수 방지: ref로 최신 URL 추적
  const imagePreviewRef = useRef<string | null>(null);
  const afterImagePreviewRef = useRef<string | null>(null);

  useEffect(() => {
    imagePreviewRef.current = imagePreview;
  }, [imagePreview]);

  useEffect(() => {
    afterImagePreviewRef.current = afterImagePreview;
  }, [afterImagePreview]);

  useEffect(() => {
    return () => {
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }
      if (afterImagePreviewRef.current) {
        URL.revokeObjectURL(afterImagePreviewRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push("/admin/services");
    }
  }, [state, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (afterImagePreviewRef.current) {
        URL.revokeObjectURL(afterImagePreviewRef.current);
      }
      const url = URL.createObjectURL(file);
      setAfterImagePreview(url);
    }
  };

  return (
    <form action={formAction} className="space-y-8">
      {/* 서비스명 */}
      <div>
        <label
          htmlFor="title"
          className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3"
        >
          서비스명 (최대 50자)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={50}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
          placeholder="서비스명을 입력하세요"
        />
        {state && "errors" in state && state.errors?.title && (
          <p className="text-red-500 text-xs mt-1">{state.errors.title[0]}</p>
        )}
      </div>

      {/* 설명 */}
      <div>
        <label
          htmlFor="description"
          className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3"
        >
          설명 (최대 200자)
        </label>
        <textarea
          id="description"
          name="description"
          required
          maxLength={200}
          rows={3}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300 resize-none"
          placeholder="서비스 설명을 입력하세요"
        ></textarea>
        {state && "errors" in state && state.errors?.description && (
          <p className="text-red-500 text-xs mt-1">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {/* Before/After 이미지 업로드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label
            htmlFor="image"
            className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3"
          >
            Before 이미지 (작업 전)
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <label
            htmlFor="image"
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer font-bold text-xs mb-4"
          >
            <Plus size={16} />
            이미지 선택
          </label>
          <FocalPointPicker
            key={imagePreview}
            imageUrl={imagePreview}
            focalX={focalX}
            focalY={focalY}
            onChange={(x, y) => {
              setFocalX(x);
              setFocalY(y);
            }}
            label="Before"
          />
          <input type="hidden" name="image_focal_x" value={focalX} />
          <input type="hidden" name="image_focal_y" value={focalY} />
        </div>

        <div>
          <label
            htmlFor="image_after"
            className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3"
          >
            After 이미지 (작업 후, 선택)
          </label>
          <input
            id="image_after"
            name="image_after"
            type="file"
            accept="image/*"
            onChange={handleAfterImageChange}
            className="hidden"
          />
          <label
            htmlFor="image_after"
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer font-bold text-xs mb-4"
          >
            <Plus size={16} />
            이미지 선택
          </label>
          <FocalPointPicker
            key={afterImagePreview}
            imageUrl={afterImagePreview}
            focalX={afterFocalX}
            focalY={afterFocalY}
            onChange={(x, y) => {
              setAfterFocalX(x);
              setAfterFocalY(y);
            }}
            label="After"
          />
          <input type="hidden" name="image_after_focal_x" value={afterFocalX} />
          <input type="hidden" name="image_after_focal_y" value={afterFocalY} />
        </div>
      </div>

      {/* 정렬 순서 */}
      <div>
        <label
          htmlFor="sort_order"
          className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3"
        >
          정렬 순서
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          min="0"
          defaultValue={defaultSortOrder}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light"
        />
        {state && "errors" in state && state.errors?.sort_order && (
          <p className="text-red-500 text-xs mt-1">
            {state.errors.sort_order[0]}
          </p>
        )}
      </div>

      {/* 게시 여부 */}
      <div>
        <div className="flex items-center gap-3">
          <input
            id="is_published"
            name="is_published"
            type="checkbox"
            value="true"
            defaultChecked
            className="w-5 h-5"
          />
          <label
            htmlFor="is_published"
            className="text-sm font-bold text-slate-900"
          >
            즉시 게시
          </label>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          체크 해제 시 저장만 되고 홈페이지에 노출되지 않습니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {state && "error" in state && state.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}

      {/* 버튼 */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={
            isPending || !!(state && "success" in state && state.success)
          }
          className="px-8 py-4 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" /> 등록 중...
            </span>
          ) : (
            "등록"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-4 border border-slate-900 text-slate-900 font-bold text-sm tracking-widest hover:bg-slate-900 hover:text-white transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
