import { cache } from "react";
import { createClient } from "@/shared/lib/supabase/server";
import type { SiteConfig } from "@/shared/types/database";

export const getSiteConfig = cache(async (): Promise<SiteConfig | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_config")
      .select("*")
      .single();
    if (error) {
      console.error("[getSiteConfig] DB error:", error);
      return null;
    }
    return data as SiteConfig;
  } catch (err) {
    console.error("[getSiteConfig] Unexpected error:", err);
    return null;
  }
});
