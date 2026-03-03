import React, { createContext, useContext, useEffect, useState } from 'react';
import { ArabicRoot, UserProgress } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface DataContextType {
  roots: ArabicRoot[];
  progress: Record<string | number, UserProgress>;
  loading: boolean;
  streak: number;
  uploadRoots: (newRoots: ArabicRoot[]) => Promise<void>;
  updateProgress: (rootId: string | number, correct: boolean) => Promise<void>;
  clearData: () => Promise<void>;
  recordActivity: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, isMock } = useAuth();
  const [roots, setRoots] = useState<ArabicRoot[]>([]);
  const [progress, setProgress] = useState<Record<string | number, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load streak from local storage (works across mock and real auth for simplicity)
    const currentStreak = parseInt(localStorage.getItem('jadhr_streak') || '0', 10);
    const lastActive = localStorage.getItem('jadhr_last_active');
    
    if (lastActive) {
      const lastDate = new Date(lastActive);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastDateStr = lastDate.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDateStr !== todayStr && lastDateStr !== yesterdayStr) {
        // Streak broken
        setStreak(0);
        localStorage.setItem('jadhr_streak', '0');
      } else {
        setStreak(currentStreak);
      }
    }

    if (!user) {
      setRoots([]);
      setProgress({});
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        if (isMock) {
          const localRoots = localStorage.getItem('mockRoots');
          const localProgress = localStorage.getItem('mockProgress');
          if (localRoots) setRoots(JSON.parse(localRoots));
          if (localProgress) setProgress(JSON.parse(localProgress));
        } else {
          const { data: rootsData, error: rootsError } = await supabase!
            .from('arabic_roots')
            .select('*');
          
          if (rootsError) throw rootsError;
          setRoots(rootsData || []);

          const { data: progressData, error: progressError } = await supabase!
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id);
          
          if (progressError) throw progressError;
          
          const progressMap: Record<string | number, UserProgress> = {};
          progressData?.forEach(p => {
            progressMap[p.root_id] = p;
          });
          setProgress(progressMap);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isMock]);

  const recordActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = localStorage.getItem('jadhr_last_active');
    let currentStreak = parseInt(localStorage.getItem('jadhr_streak') || '0', 10);

    if (lastActive === today) return; // Already recorded today

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    localStorage.setItem('jadhr_last_active', today);
    localStorage.setItem('jadhr_streak', currentStreak.toString());
    setStreak(currentStreak);
  };

  const uploadRoots = async (newRoots: ArabicRoot[]) => {
    if (isMock) {
      const merged = [...roots, ...newRoots];
      const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
      setRoots(unique);
      localStorage.setItem('mockRoots', JSON.stringify(unique));
    } else {
      const { error } = await supabase!.from('arabic_roots').upsert(newRoots);
      if (error) throw error;
      
      const { data } = await supabase!.from('arabic_roots').select('*');
      if (data) setRoots(data);
    }
  };

  const updateProgress = async (rootId: string | number, correct: boolean) => {
    const current = progress[rootId] || {
      root_id: rootId,
      correct_count: 0,
      incorrect_count: 0,
      last_reviewed: null,
      status: 'new'
    };

    const updated: UserProgress = {
      ...current,
      correct_count: current.correct_count + (correct ? 1 : 0),
      incorrect_count: current.incorrect_count + (correct ? 0 : 1),
      last_reviewed: new Date().toISOString(),
      status: current.correct_count + (correct ? 1 : 0) > 3 ? 'mastered' : 'learning'
    };

    const newProgress = { ...progress, [rootId]: updated };
    setProgress(newProgress);

    if (isMock) {
      localStorage.setItem('mockProgress', JSON.stringify(newProgress));
    } else {
      const { error } = await supabase!.from('user_progress').upsert({
        ...updated,
        user_id: user.id
      });
      if (error) throw error;
    }
  };

  const clearData = async () => {
    if (isMock) {
      localStorage.removeItem('mockRoots');
      localStorage.removeItem('mockProgress');
      setRoots([]);
      setProgress({});
    }
  };

  return (
    <DataContext.Provider value={{ roots, progress, loading, streak, uploadRoots, updateProgress, clearData, recordActivity }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
