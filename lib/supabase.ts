import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getSupabaseClient = (): SupabaseClient | null => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = getSupabaseClient() as SupabaseClient;

export const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export interface WeddingSettings {
  id: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  engagement_time: string;
  church_service_time: string;
  venue_name: string;
  venue_address: string;
  reception_details: string;
  hashtag: string;
  rsvp_deadline: string;
  rsvp_phones: string[];
}

export interface GalleryImage {
  id: string;
  url: string;
  order: number;
}

export interface RSVP {
  id: string;
  name: string;
  email: string;
  attending: string;
  guests: number;
  message: string;
  created_at: string;
}
