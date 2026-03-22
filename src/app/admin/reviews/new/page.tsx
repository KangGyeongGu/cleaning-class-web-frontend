import { NewReviewForm } from "@/app/admin/reviews/new/NewReviewForm";

export default function NewReviewPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">
        리뷰 신규 등록
      </h1>
      <NewReviewForm />
    </div>
  );
}
