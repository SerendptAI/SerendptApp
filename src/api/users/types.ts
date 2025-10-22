export type User = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  is_verified: boolean;
  plan: string;
  word_count_remaining: number;
  qa_prompts_remaining: number;
  google_id: string;
};

export type GetUserResponse = User;
