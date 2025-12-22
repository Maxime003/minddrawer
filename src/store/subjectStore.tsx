import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Subject, CreateSubjectInput } from '../types/subject';

interface SubjectContextType {
  subjects: Subject[];
  createSubject: (input: CreateSubjectInput) => void;
  updateNextReview: (subjectId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const createSubject = (input: CreateSubjectInput) => {
    const now = new Date();
    const nextReviewAt = new Date(now);
    nextReviewAt.setDate(now.getDate() + 1);

    const newSubject: Subject = {
      id: Date.now().toString(),
      ...input,
      createdAt: now,
      nextReviewAt: nextReviewAt,
    };

    setSubjects((prev) => [...prev, newSubject]);
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
