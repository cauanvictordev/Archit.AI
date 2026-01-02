// src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Esta é a URL que vimos no seu painel anteriormente
const supabaseUrl = 'https://hwkjvhgevwerdfyraimp.supabase.co' 

// ESTA É A CHAVE QUE VOCÊ ACABOU DE ACHAR:
const supabaseKey = 'sb_publishable_Vg996PmXUj_nfxakO8sGWQ_tpcSTQw_' 

export const supabase = createClient(supabaseUrl, supabaseKey)