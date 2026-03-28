import { notFound } from "next/navigation";
import { getFaqById } from "@/shared/lib/queries/faq";
import { EditFaqForm } from "@/app/admin/faq/[id]/edit/EditFaqForm.client";

interface EditFaqPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  const { id } = await params;
  const faq = await getFaqById(id);

  if (!faq) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-black text-slate-900">FAQ 수정</h1>
      <EditFaqForm faq={faq} />
    </div>
  );
}
