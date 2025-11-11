
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  published: boolean;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  image_key: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  slug?: string | null;
  seo_title?: string | null;
  excerpt?: string | null;
  featured_image_alt?: string | null;
  social_image_key?: string | null;
  reading_time?: number | null;
}

export interface BlogFormValues {
  title: string;
  content: string;
  category: string;
  tags: string[];
  published: boolean;
  image_key: string | null;
  meta_description: string;
  meta_keywords: string[];
  slug: string;
  seo_title: string;
  excerpt: string;
  featured_image_alt: string;
  social_image_key: string | null;
  reading_time: number | null;
}
