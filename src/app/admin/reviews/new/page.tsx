"use client";

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createReview } from '@/shared/actions/review';
import { Loader2, X, Plus } from 'lucide-react';
import Image from 'next/image';

export default function NewReviewPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createReview, null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (formData: FormData) => {
    // 태그를 JSON 문자열로 추가
    formData.set('tags', JSON.stringify(tags));
    await formAction(formData);
  };

  // 성공 시 리다이렉트
  if (state && 'success' in state && state.success) {
    router.push('/admin/reviews');
    return null;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">리뷰 신규 등록</h1>

      <form action={handleSubmit} className="space-y-8">
        {/* 제목 */}
        <div>
          <label htmlFor="title" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
            제목 (최대 100자)
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={100}
            className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
            placeholder="리뷰 제목을 입력하세요"
          />
          {state && 'errors' in state && state.errors?.title && (
            <p className="text-red-500 text-xs mt-1">{state.errors.title[0]}</p>
          )}
        </div>

        {/* 소개글 */}
        <div>
          <label htmlFor="summary" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
            소개글 (최대 200자)
          </label>
          <textarea
            id="summary"
            name="summary"
            required
            maxLength={200}
            rows={3}
            className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300 resize-none"
            placeholder="리뷰 소개글을 입력하세요"
          ></textarea>
          {state && 'errors' in state && state.errors?.summary && (
            <p className="text-red-500 text-xs mt-1">{state.errors.summary[0]}</p>
          )}
        </div>

        {/* 태그 */}
        <div>
          <label htmlFor="tagInput" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
            태그
          </label>
          <div className="flex gap-2 mb-3">
            <input
              id="tagInput"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
              placeholder="태그 입력 후 추가 버튼 클릭 또는 Enter"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 border border-slate-900 text-slate-900 font-bold text-xs hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 text-sm">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-500 hover:text-slate-900">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          {state && 'errors' in state && state.errors?.tags && (
            <p className="text-red-500 text-xs mt-1">{state.errors.tags[0]}</p>
          )}
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label htmlFor="image" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
            이미지
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            required
            onChange={handleImageChange}
            className="hidden"
          />
          <label
            htmlFor="image"
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer font-bold text-xs"
          >
            <Plus size={16} />
            이미지 선택
          </label>
          {imagePreview && (
            <div className="mt-4 relative w-full max-w-md h-64 border border-slate-200">
              <Image src={imagePreview} alt="미리보기" fill className="object-cover" sizes="(max-width: 768px) 100vw, 448px" />
            </div>
          )}
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
            defaultValue="0"
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
            className="w-5 h-5"
          />
          <label htmlFor="is_published" className="text-sm font-bold text-slate-900">
            즉시 게시
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
                <Loader2 className="animate-spin w-4 h-4" /> 등록 중...
              </span>
            ) : (
              '등록'
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
    </div>
  );
}
