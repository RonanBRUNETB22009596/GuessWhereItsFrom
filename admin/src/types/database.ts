export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          last_login?: string | null
        }
      }
      themes: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          theme_id: string
          prompt: string
          image_url: string | null
          correct_answer: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          explanation: string | null
          difficulty: string
          created_at: string
        }
        Insert: {
          id?: string
          theme_id: string
          prompt: string
          image_url?: string | null
          correct_answer: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          explanation?: string | null
          difficulty: string
          created_at?: string
        }
        Update: {
          id?: string
          theme_id?: string
          prompt?: string
          image_url?: string | null
          correct_answer?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          explanation?: string | null
          difficulty?: string
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          theme_id: string
          score: number
          total_questions: number
          started_at: string
          ended_at: string | null
        }
      }
      question_responses: {
        Row: {
          id: string
          session_id: string
          question_id: string
          selected_answer: string
          is_correct: boolean
          response_time_ms: number
          answered_at: string
        }
      }
    }
  }
}
