import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Subject, CreateSubjectInput, MindMapNode } from '../types/subject';
import { generateMindMap } from '../services/aiService';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthProvider';
import { calculateSM2 } from '../utils/sm2';

interface SubjectContextType {
  subjects: Subject[];
  createSubject: (input: CreateSubjectInput) => Promise<string>; // On passe en Promise !
  updateNextReview: (subjectId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  deleteSubject: (id: string) => Promise<void>;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const SubjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { user } = useAuth();

  // Fonction Helper pour créer la date J+1
  const getNextDay = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  };

  // Fonction pour charger les sujets depuis Supabase
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

      // Mapping snake_case (DB) -> camelCase (App)
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

  // Chargement des sujets quand l'utilisateur change
  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const createSubject = async (input: CreateSubjectInput): Promise<string> => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    // 1. On appelle l'IA (ou le mock si ça plante)
    let generatedMindMap: MindMapNode;
    try {
      generatedMindMap = await generateMindMap(input.title, input.context, input.rawNotes);
    } catch (e) {
      console.log("Fallback mock utilisé");
      generatedMindMap = { id: "err", text: "Erreur", children: [] };
    }

    const now = new Date();
    const nextReviewAt = new Date();

    // 2. Insertion en base de données (mapping camelCase -> snake_case)
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
      console.error('Erreur lors de la création du sujet:', error);
      throw error;
    }

    // 3. Mise à jour de l'état local avec le sujet créé
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
    // Trouver le sujet actuel
    const currentSubject = subjects.find((s) => s.id === subjectId);
    if (!currentSubject) {
      console.error('Sujet non trouvé:', subjectId);
      return;
    }

    // Mapping des difficultés vers les qualités SM-2
    const qualityMap = {
      hard: 3,
      medium: 4,
      easy: 5,
    };
    const quality = qualityMap[difficulty];

    // Calcul SM-2
    const sm2Result = calculateSM2(
      quality,
      currentSubject.lastInterval,
      currentSubject.reviewCount,
      currentSubject.difficultyFactor
    );

    // Calcul de la nouvelle date de révision
    const now = new Date();
    const newNextReviewAt = new Date(now);
    newNextReviewAt.setDate(now.getDate() + sm2Result.interval);
    // Mise à jour en base de données
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
      console.error('Erreur lors de la mise à jour du sujet:', error);
      return;
    }

    // Mise à jour de l'état local
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
    // Suppression en base de données
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) {
      console.error('Erreur lors de la suppression du sujet:', error);
      throw error;
    }

    // Mise à jour de l'état local en filtrant l'ID supprimé
    setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId));
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