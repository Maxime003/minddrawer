import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Subject, CreateSubjectInput, MindMapNode } from '../types/subject';
import { generateMindMap } from '../services/aiService';

interface SubjectContextType {
  subjects: Subject[];
  createSubject: (input: CreateSubjectInput) => Promise<string>; // Retourne l'ID du sujet créé
  updateNextReview: (subjectId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  resetForReview: (subjectId: string) => void; // Debug: force nextReviewAt à maintenant
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const createMockMindMap = (title: string): MindMapNode => {
    const nodeId = Date.now().toString();
    return {
      id: nodeId,
      text: title,
      children: [
        {
          id: `${nodeId}-1`,
          text: 'Concept principal 1',
          children: [
            {
              id: `${nodeId}-1-1`,
              text: 'Détail 1.1',
            },
          ],
        },
        {
          id: `${nodeId}-2`,
          text: 'Concept principal 2',
        },
        {
          id: `${nodeId}-3`,
          text: 'Concept principal 3',
          children: [
            {
              id: `${nodeId}-3-1`,
              text: 'Détail 3.1',
            },
            {
              id: `${nodeId}-3-2`,
              text: 'Détail 3.2',
            },
          ],
        },
      ],
    };
  };

  const createSubject = async (input: CreateSubjectInput): Promise<string> => {
    const now = new Date();
    const subjectId = Date.now().toString();
    
    // Utilise forceDate si fourni (pour debug), sinon J+1 par défaut
    const nextReviewAt = input.forceDate 
      ? new Date(input.forceDate)
      : (() => {
          const date = new Date(now);
          date.setDate(now.getDate() + 1);
          return date;
        })();

    // Génère la Mind Map avec l'IA, ou utilise celle fournie, ou fallback sur mock en cas d'erreur
    let mindMap: MindMapNode;
    
    if (input.mindMap) {
      // Si une mindMap est fournie, on l'utilise
      mindMap = input.mindMap;
    } else {
      try {
        // Tentative de génération avec l'IA
        mindMap = await generateMindMap(input.title, input.context, input.rawNotes);
      } catch (error) {
        // En cas d'erreur (API key manquante, erreur réseau, parsing JSON, etc.), fallback sur mock
        console.warn('Erreur lors de la génération IA, utilisation du mock:', error);
        mindMap = createMockMindMap(input.title);
      }
    }

    const newSubject: Subject = {
      id: subjectId,
      title: input.title,
      context: input.context,
      rawNotes: input.rawNotes,
      mindMap: mindMap,
      difficultyFactor: 2.5, // Valeur initiale SuperMemo
      reviewCount: 0,
      createdAt: now,
      nextReviewAt: nextReviewAt,
    };

    setSubjects((prev) => [...prev, newSubject]);
    return subjectId;
  };

  const updateNextReview = (subjectId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    const now = new Date();
    const daysToAdd = difficulty === 'hard' ? 1 : difficulty === 'medium' ? 3 : 7;
    const newNextReviewAt = new Date(now);
    newNextReviewAt.setDate(now.getDate() + daysToAdd);

    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId
          ? { ...subject, nextReviewAt: newNextReviewAt }
          : subject
      )
    );
  };

  const resetForReview = (subjectId: string) => {
    // Debug: force nextReviewAt à maintenant pour simuler qu'un sujet est prêt à être révisé
    const now = new Date();
    
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId
          ? { ...subject, nextReviewAt: now }
          : subject
      )
    );
  };

  return (
    <SubjectContext.Provider value={{ subjects, createSubject, updateNextReview, resetForReview }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubjectStore = () => {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error('useSubjectStore must be used within a SubjectProvider');
  }
  return context;
};
