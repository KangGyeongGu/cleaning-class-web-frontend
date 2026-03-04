"use client";

import { useActionState, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateService } from '@/shared/actions/service';
import { Loader2, Plus } from 'lucide-react';
import { FocalPointPicker } from '@/app/admin/services/FocalPointPicker';
import type { Service } from '@/shared/types/database';

interface EditServiceFormProps {
  service: Service;
  imageUrl: string;
  afterImageUrl?: string;
}

export function EditServiceForm({ service, imageUrl, afterImageUrl }: EditServiceFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateService.bind(null, String(service.id)),
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);
  const [focalX, setFocalX] = useState(service.image_focal_x);
  const [focalY, setFocalY] = useState(service.image_focal_y);
  const [afterFocalX, setAfterFocalX] = useState(service.image_after_focal_x);
  const [afterFocalY, setAfterFocalY] = useState(service.image_after_focal_y);

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

  // 성공 시 리다이렉트
  if (state && 'success' in state && state.success) {
    router.push('/admin/services');
    return null;
  }

  const displayImageUrl = imagePreview || imageUrl;
  const displayAfterImageUrl = afterImagePreview || afterImageUrl;

  return (
    <form action={formAction} className="space-y-8">
      {/* 서비스명 */}
      <div>
        <label htmlFor="title" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          서비스명 (최대 50자)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={50}
          defaultValue={service.title}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
          placeholder="서비스명을 입력하세요"
        />
        {state && 'errors' in state && state.errors?.title && (
          <p className="text-red-500 text-xs mt-1">{state.errors.title[0]}</p>
        )}
      </div>

      {/* 설명 */}
      <div>
        <label htmlFor="description" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          설명 (최대 200자)
        </label>
        <textarea
          id="description"
          name="description"
          required
          maxLength={200}
          rows={3}
          defaultValue={service.description}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300 resize-none"
          placeholder="서비스 설명을 입력하세요"
        ></textarea>
        {state && 'errors' in state && state.errors?.description && (
          <p className="text-red-500 text-xs mt-1">{state.errors.description[0]}</p>
        )}
      </div>

      {/* Before/After 이미지 업로드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label htmlFor="image" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
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
            {imagePreview ? '이미지 변경' : '새 이미지 선택'}
          </label>
          <FocalPointPicker
            key={displayImageUrl}
            imageUrl={displayImageUrl}
            focalX={focalX}
            focalY={focalY}
            onChange={(x, y) => { setFocalX(x); setFocalY(y); }}
            label="Before"
          />
          <input type="hidden" name="image_focal_x" value={focalX} />
          <input type="hidden" name="image_focal_y" value={focalY} />
        </div>

        <div>
          <label htmlFor="image_after" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
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
            {afterImagePreview ? '이미지 변경' : '새 이미지 선택'}
          </label>
          <FocalPointPicker
            key={displayAfterImageUrl ?? 'no-after'}
            imageUrl={displayAfterImageUrl ?? null}
            focalX={afterFocalX}
            focalY={afterFocalY}
            onChange={(x, y) => { setAfterFocalX(x); setAfterFocalY(y); }}
            label="After"
          />
          <input type="hidden" name="image_after_focal_x" value={afterFocalX} />
          <input type="hidden" name="image_after_focal_y" value={afterFocalY} />
        </div>
      </div>

      {/* 정렬 순서 */}
      <div>
        <label htmlFor="sort_order" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          정렬 순서
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          min="0"
          defaultValue={service.sort_order}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light"
        />
        {state && 'errors' in state && state.errors?.sort_order && (
          <p className="text-red-500 text-xs mt-1">{state.errors.sort_order[0]}</p>
        )}
      </div>

      {/* 게시 여부 */}
      <div className="flex items-center gap-3">
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          value="true"
          defaultChecked={service.is_published}
          className="w-5 h-5"
        />
        <label htmlFor="is_published" className="text-sm font-bold text-slate-900">
          게시
        </label>
      </div>

      {/* 에러 메시지 */}
      {state && 'error' in state && state.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}

      {/* 버튼 */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-4 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" /> 수정 중...
            </span>
          ) : (
            '수정'
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
