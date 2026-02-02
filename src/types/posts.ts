export interface Post {
  id: string;
  title_en: string;
  title_ka: string;
  title_ru: string;
  content_en: string;
  content_ka: string;
  content_ru: string;
  image_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PostFormData {
  title_en: string;
  title_ka: string;
  title_ru: string;
  content_en: string;
  content_ka: string;
  content_ru: string;
  image_path?: string | null;
  published: boolean;
}
