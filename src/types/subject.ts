export interface MindMapNode {
  id: string;
  text: string;
  children?: MindMapNode[];
}

export interface Subject {
  id: string;
  title: string;
  context: string;
  rawNotes: string;
  mindMap: MindMapNode;
  difficultyFactor: number; // EF (Ease Factor) pour SuperMemo, entre 1.3 et 2.5
  reviewCount: number;
  createdAt: Date;
  nextReviewAt: Date;
}

export interface CreateSubjectInput {
  title: string;
  context: string;
  rawNotes: string;
  mindMap?: MindMapNode; // Optionnel, sera généré si non fourni
}
