import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://cynixmqapblqhzyknxzr.supabase.co";
const supabaseAnonKey = "sb_publishable_i_p6L9vHHxxLtX7RuoQMnA_8Wu4krqe";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);