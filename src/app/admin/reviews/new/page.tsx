import { NewReviewForm } from "@/app/admin/reviews/new/NewReviewForm";
import { createClient } from "@/shared/lib/supabase/server";

export default async function NewReviewPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextSortOrder = (data?.sort_order ?? -1) + 1;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">
        리뷰 신규 등록
      </h1>
      <NewReviewForm defaultSortOrder={nextSortOrder} />
    </div>
  );
}
