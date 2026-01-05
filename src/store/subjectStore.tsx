import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Subject, CreateSubjectInput, MindMapNode } from '../types/subject';
import { generateMindMap } from '../services/aiService';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthProvider';
import { calculateSM2 } from '../utils/sm2';

interface SubjectContextType {
  subjects: Subject[];
  createSubject: (input: CreateSubjectInput) => Promise<string>;
  updateNextReview: (subjectId: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { user } = useAuth();

  // Chargement des sujets depuis Supabase
  const fetchSubjects = async () => {
    if (!user) {
      setSubjects([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des sujets:', error);
        return;
      }

      const mappedSubjects: Subject[] = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        context: item.context,
        rawNotes: item.raw_notes,
        mindMap: item.mind_map,
        difficultyFactor: item.difficulty_factor,
        reviewCount: item.review_count,
        lastInterval: item.last_interval || 0,
        createdAt: new Date(item.created_at),
        nextReviewAt: new Date(item.next_review_at),
      }));

      setSubjects(mappedSubjects);
    } catch (error) {
      console.error('Erreur lors du chargement des sujets:', error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const createSubject = async (input: CreateSubjectInput): Promise<string> => {
    if (!user) throw new Error('Utilisateur non connecté');

    // 1. Génération IA ou Mock en cas d'erreur
    let generatedMindMap: MindMapNode;
    try {
      generatedMindMap = await generateMindMap(input.title, input.context, input.rawNotes);
    } catch (e) {
      console.log("Erreur IA, utilisation d'une structure vide", e);
      generatedMindMap = { 
        id: "root", 
        text: input.title, 
        children: [{ id: "err", text: "Génération échouée, réessayez plus tard" }] 
      };
    }

    const now = new Date();
    // CORRECTION : Prochaine révision à J+1 (Demain)
    const nextReviewAt = new Date();
    nextReviewAt.setDate(now.getDate() + 1);

    // 2. Insertion Supabase
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: user.id,
        title: input.title,
        context: input.context,
        raw_notes: input.rawNotes,
        mind_map: generatedMindMap,
        difficulty_factor: 2.5,
        review_count: 0,
        last_interval: 0,
        created_at: now.toISOString(),
        next_review_at: nextReviewAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur insert subject:', error);
      throw error;
    }

    // 3. Update local
    const newSubject: Subject = {
      id: data.id,
      title: data.title,
      context: data.context,
      rawNotes: data.raw_notes,
      mindMap: data.mind_map,
      difficultyFactor: data.difficulty_factor,
      reviewCount: data.review_count,
      lastInterval: data.last_interval || 0,
      createdAt: new Date(data.created_at),
      nextReviewAt: new Date(data.next_review_at),
    };

    setSubjects((prev) => [newSubject, ...prev]);
    return data.id;
  };

  const updateNextReview = async (subjectId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    const currentSubject = subjects.find((s) => s.id === subjectId);
    if (!currentSubject) return;

    const qualityMap = { hard: 3, medium: 4, easy: 5 };
    const quality = qualityMap[difficulty];

    const sm2Result = calculateSM2(
      quality,
      currentSubject.lastInterval,
      currentSubject.reviewCount,
      currentSubject.difficultyFactor
    );

    const now = new Date();
    const newNextReviewAt = new Date(now);
    newNextReviewAt.setDate(now.getDate() + sm2Result.interval);

    const { error } = await supabase
      .from('subjects')
      .update({
        next_review_at: newNextReviewAt.toISOString(),
        difficulty_factor: sm2Result.easeFactor,
        review_count: sm2Result.repetitions,
        last_interval: sm2Result.interval,
      })
      .eq('id', subjectId);

    if (error) {
      console.error('Erreur update review:', error);
      return;
    }

    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              nextReviewAt: newNextReviewAt,
              difficultyFactor: sm2Result.easeFactor,
              reviewCount: sm2Result.repetitions,
              lastInterval: sm2Result.interval,
            }
          : subject
      )
    );
  };

  const deleteSubject = async (subjectId: string): Promise<void> => {
    const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
    if (error) throw error;
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  };

  return (
    <SubjectContext.Provider value={{ subjects, createSubject, updateNextReview, deleteSubject }}>
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