import { createClient } from '@supabase/supabase-js'

export type QuestionType = 'welcome' | 'short_text' | 'long_text' | 'yes_no' | 'multiple_choice' | 'rating' | 'email' | 'phone' | 'thank_you'

export interface Form {
  id: string
  slug: string
  title: string
  client_name: string | null
  description: string | null
  theme: { bg: string; accent: string; primary: string }
  is_published: boolean
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  form_id: string
  position: number
  type: QuestionType
  title: string
  subtitle: string | null
  config: {
    placeholder?: string
    required?: boolean
    options?: string[]
    max_rating?: number
  }
  created_at: string
}

export interface Response {
  id: string
  form_id: string
  answers: Record<string, unknown>
  submitted_at: string
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
