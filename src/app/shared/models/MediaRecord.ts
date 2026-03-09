import { MediaType } from './MediaType';

export interface MediaRecord {
  id: string | number;
  title: string;
  description: string;
  file_url: string;
  registration_date: string;
  historical_date?: string | null;
  keywords?: string[] | null;
  author_donor?: string | null;

  museum_id: string | number;
  media_type: MediaType;
  thumbnail_url?: string;
}

