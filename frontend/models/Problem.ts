export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  userSubmission?: {
    id: string;
    is_draft: boolean;
  } | null;
}
