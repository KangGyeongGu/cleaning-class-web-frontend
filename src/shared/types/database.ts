// supabase gen types 기반 자동 생성 — 수동 편집 금지

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      customer_reviews: {
        Row: {
          comment: string;
          created_at: string;
          id: string;
          is_published: boolean;
          nickname: string;
          rating: number;
          service_type: string | null;
          token_id: string;
        };
        Insert: {
          comment: string;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          nickname?: string;
          rating: number;
          service_type?: string | null;
          token_id: string;
        };
        Update: {
          comment?: string;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          nickname?: string;
          rating?: number;
          service_type?: string | null;
          token_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_reviews_token_id_fkey";
            columns: ["token_id"];
            isOneToOne: true;
            referencedRelation: "review_tokens";
            referencedColumns: ["id"];
          },
        ];
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
      review_tokens: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          is_used: boolean;
          token: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          is_used?: boolean;
          token: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          is_used?: boolean;
          token?: string;
        };
        Relationships: [];
      };
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
          category: string;
          created_at: string;
          description: string;
          detail_image_after_path: string;
          detail_image_path: string;
          id: string;
          image_after_focal_x: number;
          image_after_focal_y: number;
          image_after_path: string;
          image_focal_x: number;
          image_focal_y: number;
          image_path: string;
          is_published: boolean;
          sort_order: number;
          tags: string[] | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          description?: string;
          detail_image_after_path?: string;
          detail_image_path?: string;
          id?: string;
          image_after_focal_x?: number;
          image_after_focal_y?: number;
          image_after_path?: string;
          image_focal_x?: number;
          image_focal_y?: number;
          image_path?: string;
          is_published?: boolean;
          sort_order?: number;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          detail_image_after_path?: string;
          detail_image_path?: string;
          id?: string;
          image_after_focal_x?: number;
          image_after_focal_y?: number;
          image_after_path?: string;
          image_focal_x?: number;
          image_focal_y?: number;
          image_path?: string;
          is_published?: boolean;
          sort_order?: number;
          tags?: string[] | null;
          title?: string;
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
          daangn_url: string;
          description: string;
          customer_review_description: string | null;
          email: string;
          faq_description: string | null;
          hero_image_focal_x: number;
          hero_image_focal_x_2: number;
          hero_image_focal_y: number;
          hero_image_focal_y_2: number;
          hero_image_path: string | null;
          hero_image_path_2: string | null;
          id: string;
          instagram_url: string;
          moving_address: string;
          moving_business_registration_number: string | null;
          moving_phone: string;
          moving_representative: string;
          phone: string;
          representative: string;
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
          daangn_url?: string;
          description?: string;
          customer_review_description?: string | null;
          email?: string;
          faq_description?: string | null;
          hero_image_focal_x?: number;
          hero_image_focal_x_2?: number;
          hero_image_focal_y?: number;
          hero_image_focal_y_2?: number;
          hero_image_path?: string | null;
          hero_image_path_2?: string | null;
          id?: string;
          instagram_url?: string;
          moving_address?: string;
          moving_business_registration_number?: string | null;
          moving_phone?: string;
          moving_representative?: string;
          phone?: string;
          representative?: string;
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
          customer_review_description?: string | null;
          daangn_url?: string;
          description?: string;
          email?: string;
          faq_description?: string | null;
          hero_image_focal_x?: number;
          hero_image_focal_x_2?: number;
          hero_image_focal_y?: number;
          hero_image_focal_y_2?: number;
          hero_image_path?: string | null;
          hero_image_path_2?: string | null;
          id?: string;
          instagram_url?: string;
          moving_address?: string;
          moving_business_registration_number?: string | null;
          moving_phone?: string;
          moving_representative?: string;
          phone?: string;
          representative?: string;
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
      submit_customer_review: {
        Args: { p_comment: string; p_rating: number; p_token: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

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

export type ReviewTokenRow =
  Database["public"]["Tables"]["review_tokens"]["Row"];
export type ReviewTokenInsert =
  Database["public"]["Tables"]["review_tokens"]["Insert"];

export type CustomerReviewRow =
  Database["public"]["Tables"]["customer_reviews"]["Row"];
export type CustomerReviewInsert =
  Database["public"]["Tables"]["customer_reviews"]["Insert"];
