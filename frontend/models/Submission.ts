export interface Submission {
  id: string;
  problem_id: string;
  problem_title: string;
  feedback?: {
    score?: number;
    strengths?: string[];
    improvements?: string[];
  };
  created_at: string;
  is_draft: boolean;
  user_id: string;
}
