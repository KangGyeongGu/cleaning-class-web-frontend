"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { deleteService, toggleServicePublish } from "@/shared/actions/service";
import type { Service } from "@/shared/types/database";

interface ServiceListClientProps {
  services: (Service & { imageUrl: string })[];
}

export function ServiceListClient({ services }: ServiceListClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (serviceId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    setDeletingId(serviceId);
    const result = await deleteService(serviceId);
    setDeletingId(null);

    if (!result.success) {
      alert(result.error || "삭제 중 오류가 발생했습니다.");
    } else {
      router.refresh();
    }
  };

  const handleTogglePublish = async (
    serviceId: string,
    currentStatus: boolean,
  ) => {
    setTogglingId(serviceId);
    const result = await toggleServicePublish(serviceId, !currentStatus);
    setTogglingId(null);

    if (!result.success) {
      alert(result.error || "게시 상태 변경 중 오류가 발생했습니다.");
    } else {
      router.refresh();
    }
  };

  return (
    <div className="border border-slate-200">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200">
        <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
          이미지
        </div>
        <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
          서비스명
        </div>
        <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
          설명
        </div>
        <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
          게시
        </div>
        <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
          순서
        </div>
        <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
          등록일
        </div>
        <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
          작업
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-200">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center space-y-3 md:space-y-0"
          >
            {/* 이미지 */}
            <div className="col-span-1">
              <div className="relative w-16 h-16 border border-slate-200">
                <Image
                  src={service.imageUrl}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </div>

            {/* 서비스명 */}
            <div className="col-span-3">
              <p className="font-bold text-slate-900 text-sm">
                {service.title}
              </p>
            </div>

            {/* 설명 */}
            <div className="col-span-3">
              <p className="text-xs text-slate-500 line-clamp-2">
                {service.description}
              </p>
            </div>

            {/* 게시 상태 */}
            <div className="col-span-1 text-center">
              <button
                type="button"
                onClick={() =>
                  handleTogglePublish(service.id, service.is_published)
                }
                disabled={togglingId === service.id}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
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

            {/* 정렬 순서 */}
            <div className="col-span-1 text-center">
              <span className="text-sm text-slate-500">
                {service.sort_order}
              </span>
            </div>

            {/* 등록일 */}
            <div className="col-span-1">
              <span className="text-xs text-slate-500">
                {new Date(service.created_at).toLocaleDateString("ko-KR")}
              </span>
            </div>

            {/* 작업 버튼 */}
            <div className="col-span-2 flex justify-end gap-2">
              <Link
                href={`/admin/services/${service.id}/edit`}
                className="px-3 py-2 border border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors text-xs font-bold"
              >
                <Edit size={14} />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(service.id)}
                disabled={deletingId === service.id}
                className="px-3 py-2 border border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-500 transition-colors text-xs font-bold disabled:opacity-50"
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
