export interface MindMapNode {
  id: string;
  text: string;
  children?: MindMapNode[];
}

export type ContextType = 'course' | 'book' | 'article' | 'idea';

export const CONTEXT_LABELS: Record<ContextType, string> = {
  course: 'Cours',
  book: 'Livre',
  article: 'Article',
  idea: 'Idée / Pensée',
};

export interface Subject {
  id: string;
  title: string;
  context: ContextType;
  rawNotes: string;
  mindMap: MindMapNode;
  difficultyFactor: number; // EF (Ease Factor) pour SuperMemo, entre 1.3 et 2.5
  reviewCount: number;
  createdAt: Date;
  nextReviewAt: Date;
}

export interface CreateSubjectInput {
  title: string;
  context: ContextType;
  rawNotes: string;
  mindMap?: MindMapNode; // Optionnel, sera généré si non fourni
  forceDate?: Date; // Optionnel, pour debug : force nextReviewAt à cette date
}
