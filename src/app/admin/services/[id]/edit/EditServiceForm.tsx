"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateService } from "@/shared/actions/service";
import { Loader2, Plus, X } from "lucide-react";
import { FocalPointPicker } from "@/app/admin/components/FocalPointPicker";
import type { Service } from "@/shared/types/database";

interface EditServiceFormProps {
  service: Service;
  imageUrl: string;
  afterImageUrl?: string;
}

export function EditServiceForm({
  service,
  imageUrl,
  afterImageUrl,
}: EditServiceFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateService.bind(null, String(service.id)),
    null,
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(
    null,
  );
  const [tags, setTags] = useState<string[]>(service.tags ?? []);
  const [tagInput, setTagInput] = useState("");
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

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push("/admin/services");
    }
  }, [state, router]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && trimmed.length <= 30 && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set("tags", JSON.stringify(tags));
    await formAction(formData);
  };

  const displayImageUrl = imagePreview || imageUrl;
  const displayAfterImageUrl = afterImagePreview || afterImageUrl;

  return (
    <form action={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="title" className="form-label">
          서비스명 (최대 50자)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={50}
          defaultValue={service.title}
          className="form-input-lg placeholder:text-slate-300"
          placeholder="서비스명을 입력하세요"
        />
        {state && "errors" in state && state.errors?.title && (
          <p className="form-error">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="tagInput" className="form-label">
          서비스 태그
        </label>
        <div className="mb-3 flex gap-2">
          <input
            id="tagInput"
            type="text"
            value={tagInput}
            maxLength={30}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                // 한글 조합 중 Enter 입력 무시
                if (!e.nativeEvent.isComposing) {
                  handleAddTag();
                }
              }
            }}
            className="form-input-lg flex-1 placeholder:text-slate-300"
            placeholder="태그 입력 후 추가 버튼 클릭 또는 Enter (최대 30자)"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="border border-slate-900 px-4 py-2 text-xs font-bold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        {state && "errors" in state && state.errors?.tags && (
          <p className="form-error">{state.errors.tags[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="image" className="form-label">
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
            className="mb-4 inline-flex cursor-pointer items-center gap-2 border border-slate-200 px-6 py-3 text-xs font-bold text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900"
          >
            <Plus size={16} />
            {imagePreview ? "이미지 변경" : "새 이미지 선택"}
          </label>
          <FocalPointPicker
            key={displayImageUrl}
            imageUrl={displayImageUrl}
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
          <label htmlFor="image_after" className="form-label">
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
            className="mb-4 inline-flex cursor-pointer items-center gap-2 border border-slate-200 px-6 py-3 text-xs font-bold text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900"
          >
            <Plus size={16} />
            {afterImagePreview ? "이미지 변경" : "새 이미지 선택"}
          </label>
          <FocalPointPicker
            key={displayAfterImageUrl ?? "no-after"}
            imageUrl={displayAfterImageUrl ?? null}
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

      <div>
        <label htmlFor="sort_order" className="form-label">
          정렬 순서
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          min="0"
          defaultValue={service.sort_order}
          className="form-input-lg"
        />
        {state && "errors" in state && state.errors?.sort_order && (
          <p className="form-error">{state.errors.sort_order[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          value="true"
          defaultChecked={service.is_published}
          className="h-5 w-5"
        />
        <label
          htmlFor="is_published"
          className="text-sm font-bold text-slate-900"
        >
          게시
        </label>
      </div>

      {state && "error" in state && state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-8 py-4"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 수정 중...
            </span>
          ) : (
            "수정"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline px-8 py-4"
        >
          취소
        </button>
      </div>
    </form>
  );
}
