export type Theme = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
};

export type Question = {
  id: string;
  theme_id: string;
  prompt: string;
  image_url?: string;
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
};

export type GameSession = {
  id: string;
  user_id: string;
  theme_id: string;
  score: number;
  total_questions: number;
  started_at: string;
  ended_at?: string;
};

export type QuestionResponse = {
  id: string;
  session_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  response_time_ms: number;
  answered_at: string;
};

export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  last_login?: string;
};
