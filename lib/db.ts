
export interface WeddingSettings {
  id: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  engagement_time: string;
  engagement_date: string;
  bride_family_name: string;
  groom_family_name: string;
  venue_map_url?: string;
  footer_note?: string;
  church_service_time: string;
  venue_name: string;
  venue_address: string;
  reception_details: string;
  hashtag: string;
  rsvp_deadline: string;
  rsvp_phones: string[];
  hero_image_url?: string;
  background_image_url?: string;
  details_image_url?: string;
  music_url?: string;
  wallet_address?: string;
  bank_details?: string;
  updated_at?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  order: number;
  created_at?: string;
}

export interface RSVP {
  id: string;
  name: string;
  email: string;
  attending: 'yes' | 'no';
  guests: number;
  message?: string;
  created_at?: string;
}

export const isDbConfigured = true; // Neon is server-side configured
