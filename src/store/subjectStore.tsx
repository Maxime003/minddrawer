import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Subject, CreateSubjectInput, MindMapNode } from '../types/subject';
import { generateMindMap } from '../services/aiService';

interface SubjectContextType {
  subjects: Subject[];
  createSubject: (input: CreateSubjectInput) => Promise<string>; // On passe en Promise !
  updateNextReview: (subjectId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Fonction Helper pour créer la date J+1
  const getNextDay = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  };

  const createSubject = async (input: CreateSubjectInput): Promise<string> => {
    const now = new Date();
    const subjectId = Date.now().toString();

    // 1. On appelle l'IA (ou le mock si ça plante)
    let generatedMindMap: MindMapNode;
    try {
        generatedMindMap = await generateMindMap(input.title, input.context, input.rawNotes);
    } catch (e) {
        console.log("Fallback mock utilisé");
        generatedMindMap = { id: "err", text: "Erreur", children: [] };
    }

    const newSubject: Subject = {
      id: subjectId,
      title: input.title,
      context: input.context,
      rawNotes: input.rawNotes,
      mindMap: generatedMindMap,
      difficultyFactor: 2.5,
      reviewCount: 0,
      createdAt: now,
      nextReviewAt: getNextDay(),
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

  return (
    <SubjectContext.Provider value={{ subjects, createSubject, updateNextReview }}>
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