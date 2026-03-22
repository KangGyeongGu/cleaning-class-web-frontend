import { NewServiceForm } from "@/app/admin/services/new/NewServiceForm";
import { createClient } from "@/shared/lib/supabase/server";

export default async function NewServicePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextSortOrder = (data?.sort_order ?? -1) + 1;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">
        서비스 신규 등록
      </h1>
      <NewServiceForm defaultSortOrder={nextSortOrder} />
    </div>
  );
}
