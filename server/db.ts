import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jlyqbwfuvdewvhaednvd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseXFid2Z1dmRld3ZoYWVkbnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzY5MTAsImV4cCI6MjA4Nzc1MjkxMH0.GzLjvCxz-TPYCnzddtypNNsXOV8Jv-F3lHtEN5-zKIg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
