// Supabase Database 타입 정의 (supabase gen types 기반)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      reviews: {
        Row: {
          created_at: string;
          id: string;
          image_path: string;
          is_published: boolean;
          link_url: string;
          sort_order: number;
          summary: string;
          tags: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_path?: string;
          is_published?: boolean;
          link_url?: string;
          sort_order?: number;
          summary: string;
          tags?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_path?: string;
          is_published?: boolean;
          link_url?: string;
          sort_order?: number;
          summary?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          created_at: string;
          // description: TASK-STR-003 전환 전까지 하위 호환 유지 (DB 컬럼이 남아있을 수 있음)
          description?: string;
          id: string;
          image_after_focal_x: number;
          image_after_focal_y: number;
          image_after_path: string;
          image_focal_x: number;
          image_focal_y: number;
          image_path: string;
          is_published: boolean;
          sort_order: number;
          tags: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          image_after_focal_x?: number;
          image_after_focal_y?: number;
          image_after_path?: string;
          image_focal_x?: number;
          image_focal_y?: number;
          image_path?: string;
          is_published?: boolean;
          sort_order?: number;
          tags?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          image_after_focal_x?: number;
          image_after_focal_y?: number;
          image_after_path?: string;
          image_focal_x?: number;
          image_focal_y?: number;
          image_path?: string;
          is_published?: boolean;
          sort_order?: number;
          tags?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          answer: string;
          created_at: string;
          display_order: number;
          id: string;
          is_active: boolean;
          question: string;
          updated_at: string;
        };
        Insert: {
          answer: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          question: string;
          updated_at?: string;
        };
        Update: {
          answer?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          question?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_config: {
        Row: {
          address: string;
          address_locality: string;
          address_region: string;
          blog_url: string;
          business_name: string;
          business_registration_number: string | null;
          description: string;
          email: string;
          id: string;
          instagram_url: string;
          phone: string;
          representative: string;
          faq_description: string | null;
          review_description: string | null;
          service_description: string | null;
          site_url: string;
          updated_at: string;
        };
        Insert: {
          address?: string;
          address_locality?: string;
          address_region?: string;
          blog_url?: string;
          business_name?: string;
          business_registration_number?: string | null;
          description?: string;
          email?: string;
          id?: string;
          instagram_url?: string;
          phone?: string;
          representative?: string;
          faq_description?: string | null;
          review_description?: string | null;
          service_description?: string | null;
          site_url?: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          address_locality?: string;
          address_region?: string;
          blog_url?: string;
          business_name?: string;
          business_registration_number?: string | null;
          description?: string;
          email?: string;
          id?: string;
          instagram_url?: string;
          phone?: string;
          representative?: string;
          faq_description?: string | null;
          review_description?: string | null;
          service_description?: string | null;
          site_url?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// 편의 타입 별칭
export type SiteConfigRow = Database["public"]["Tables"]["site_config"]["Row"];
export type SiteConfigInsert =
  Database["public"]["Tables"]["site_config"]["Insert"];
export type SiteConfigUpdate =
  Database["public"]["Tables"]["site_config"]["Update"];

export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
export type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];

export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

export type SiteConfig = SiteConfigRow;
export type Review = ReviewRow;
export type Service = ServiceRow;

export type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];
export type FaqInsert = Database["public"]["Tables"]["faqs"]["Insert"];
export type FaqUpdate = Database["public"]["Tables"]["faqs"]["Update"];
