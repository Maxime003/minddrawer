export interface Subject {
  id: string;
  title: string;
  context: string;
  rawNotes: string;
  createdAt: Date;
  nextReviewAt: Date;
}

export interface CreateSubjectInput {
  title: string;
  context: string;
  rawNotes: string;
}
