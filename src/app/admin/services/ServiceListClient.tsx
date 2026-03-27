"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Edit, Trash2, Eye, EyeOff, Loader2, GripVertical } from "lucide-react";
import {
  deleteService,
  toggleServicePublish,
  reorderServices,
} from "@/shared/actions/service";
import type { Service } from "@/shared/types/database";

interface ServiceListClientProps {
  services: (Service & { imageUrl: string })[];
}

export function ServiceListClient({
  services: initialServices,
}: ServiceListClientProps) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDelete = async (serviceId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeletingId(serviceId);
    try {
      const result = await deleteService(serviceId);
      if (!result.success) {
        alert(result.error || "삭제 중 오류가 발생했습니다.");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("서비스 삭제 중 예외 발생:", err);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (
    serviceId: string,
    currentStatus: boolean,
  ) => {
    setTogglingId(serviceId);
    try {
      const result = await toggleServicePublish(serviceId, !currentStatus);
      if (!result.success) {
        alert(result.error || "게시 상태 변경 중 오류가 발생했습니다.");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("서비스 게시 상태 변경 중 예외 발생:", err);
      alert("게시 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (dragItem.current === dragOverItem.current) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...services];
    const [removed] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, removed);
    setServices(updated);

    dragItem.current = null;
    dragOverItem.current = null;
    setDragIndex(null);
    setDragOverIndex(null);

    setIsSaving(true);
    try {
      const result = await reorderServices(updated.map((s) => s.id));
      if (!result.success) {
        alert(result.error || "순서 변경 중 오류가 발생했습니다.");
        setServices(initialServices);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("reorderServices error:", err);
      alert("순서 변경 중 오류가 발생했습니다.");
      setServices(initialServices);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-slate-200">
      {isSaving && (
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          <Loader2 size={12} className="animate-spin" />
          순서 저장 중...
        </div>
      )}

      <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 p-4 md:grid">
        <div className="text-label col-span-1 text-slate-500">순서</div>
        <div className="text-label col-span-1 text-slate-500">이미지</div>
        <div className="text-label col-span-3 text-slate-500">서비스명</div>
        <div className="text-label col-span-3 text-slate-500">설명</div>
        <div className="text-label col-span-1 text-center text-slate-500">
          게시
        </div>
        <div className="text-label col-span-1 text-slate-500">등록일</div>
        <div className="text-label col-span-2 text-right text-slate-500">
          작업
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {services.map((service, index) => (
          <div
            key={service.id}
            role="listitem"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`cursor-grab space-y-3 p-4 transition-colors active:cursor-grabbing md:grid md:grid-cols-12 md:items-center md:gap-4 md:space-y-0 ${
              dragIndex === index
                ? "bg-slate-50 opacity-50"
                : dragOverIndex === index
                  ? "border-t-2 border-t-slate-900"
                  : ""
            }`}
          >
            <div className="col-span-1 flex items-center gap-2">
              <GripVertical
                size={16}
                className="shrink-0 text-slate-300 hover:text-slate-500"
              />
              <span className="text-xs text-slate-400">{index}</span>
            </div>

            <div className="col-span-1">
              <div className="relative aspect-square h-16 w-16 border border-slate-200">
                <Image
                  src={service.imageUrl}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </div>

            <div className="col-span-3">
              <p className="text-sm font-bold text-slate-900">
                {service.title}
              </p>
            </div>

            <div className="col-span-3">
              <div className="flex flex-wrap gap-1">
                {(service.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs whitespace-nowrap text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="col-span-1 text-center">
              <button
                type="button"
                onClick={() =>
                  handleTogglePublish(service.id, service.is_published)
                }
                disabled={togglingId === service.id}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-50"
              >
                {togglingId === service.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : service.is_published ? (
                  <Eye size={14} />
                ) : (
                  <EyeOff size={14} />
                )}
                {service.is_published ? "게시" : "비공개"}
              </button>
            </div>

            <div className="col-span-1">
              <span className="text-xs text-slate-500">
                {new Date(service.created_at).toLocaleDateString("ko-KR")}
              </span>
            </div>

            <div className="col-span-2 flex justify-end gap-2">
              <Link
                href={`/admin/services/${service.id}/edit`}
                className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900"
              >
                <Edit size={14} />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(service.id)}
                disabled={deletingId === service.id}
                className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-50"
              >
                {deletingId === service.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
