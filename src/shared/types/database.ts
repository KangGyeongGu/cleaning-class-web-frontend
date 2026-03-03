// Supabase Database 타입 정의

export interface Database {
  public: {
    Tables: {
      site_config: {
        Row: SiteConfigRow;
        Insert: SiteConfigInsert;
        Update: SiteConfigUpdate;
      };
      reviews: {
        Row: ReviewRow;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
    };
  };
}

// site_config 테이블 타입
export interface SiteConfigRow {
  id: number;
  business_name: string;
  phone: string;
  email: string;
  blog_url: string | null;
  instagram_url: string | null;
  site_url: string;
  description: string | null;
  address_region: string;
  address_locality: string;
  created_at: string;
  updated_at: string;
}

export interface SiteConfigInsert {
  id?: number;
  business_name: string;
  phone: string;
  email: string;
  blog_url?: string | null;
  instagram_url?: string | null;
  site_url: string;
  description?: string | null;
  address_region: string;
  address_locality: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiteConfigUpdate {
  id?: number;
  business_name?: string;
  phone?: string;
  email?: string;
  blog_url?: string | null;
  instagram_url?: string | null;
  site_url?: string;
  description?: string | null;
  address_region?: string;
  address_locality?: string;
  created_at?: string;
  updated_at?: string;
}

// reviews 테이블 타입
export interface ReviewRow {
  id: number;
  title: string;
  summary: string;
  image_path: string;
  tags: string[];
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewInsert {
  id?: number;
  title: string;
  summary: string;
  image_path: string;
  tags: string[];
  sort_order?: number;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewUpdate {
  id?: number;
  title?: string;
  summary?: string;
  image_path?: string;
  tags?: string[];
  sort_order?: number;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Export 편의 타입
export type SiteConfig = SiteConfigRow;
export type Review = ReviewRow;
