'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress, Achievement, Note } from '@/types';

interface ProgressStore extends UserProgress {
  markTopicComplete: (topicId: string) => void;
  markTopicIncomplete: (topicId: string) => void;
  markProjectComplete: (projectId: string) => void;
  markCertificationComplete: (certId: string) => void;
  addBookmark: (id: string) => void;
  removeBookmark: (id: string) => void;
  addNote: (topicId: string, content: string) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  unlockAchievement: (achievement: Achievement) => void;
  updateQuizScore: (topicId: string, score: number) => void;
  addStudyTime: (minutes: number) => void;
  isTopicComplete: (topicId: string) => boolean;
  isBookmarked: (id: string) => boolean;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-topic', title: 'First Step', description: 'Complete your first topic', icon: '🎯', xpReward: 50 },
  { id: 'streak-7', title: 'Weekly Warrior', description: '7-day study streak', icon: '🔥', xpReward: 200 },
  { id: 'streak-30', title: 'Monthly Master', description: '30-day study streak', icon: '🏆', xpReward: 500 },
  { id: 'phase-1-complete', title: 'Python Pioneer', description: 'Complete Phase 1', icon: '🐍', xpReward: 300 },
  { id: 'phase-5-complete', title: 'Spark Wizard', description: 'Complete Phase 5', icon: '⚡', xpReward: 500 },
  { id: 'first-project', title: 'Project Builder', description: 'Complete your first project', icon: '🏗️', xpReward: 500 },
  { id: 'all-projects', title: 'Portfolio Pro', description: 'Complete all 10 projects', icon: '💼', xpReward: 2000 },
  { id: 'quiz-ace', title: 'Quiz Ace', description: 'Score 100% on any quiz', icon: '🎓', xpReward: 200 },
  { id: 'roadmap-complete', title: 'Azure Master', description: 'Complete the full roadmap', icon: '☁️', xpReward: 5000 },
];

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      completedTopics: [],
      completedProjects: [],
      completedCertifications: [],
      xp: 0,
      streak: 0,
      level: 1,
      achievements: [],
      notes: [],
      bookmarks: [],
      quizScores: {},
      studyTime: 0,
      lastStudied: new Date().toISOString(),

      markTopicComplete: (topicId) => {
        const { completedTopics, achievements } = get();
        if (!completedTopics.includes(topicId)) {
          set((state) => ({
            completedTopics: [...state.completedTopics, topicId],
            xp: state.xp + 100,
            lastStudied: new Date().toISOString(),
          }));
          if (completedTopics.length === 0) {
            get().unlockAchievement(INITIAL_ACHIEVEMENTS[0]);
          }
        }
      },

      markTopicIncomplete: (topicId) => {
        set((state) => ({
          completedTopics: state.completedTopics.filter((id) => id !== topicId),
          xp: Math.max(0, state.xp - 100),
        }));
      },

      markProjectComplete: (projectId) => {
        const { completedProjects } = get();
        if (!completedProjects.includes(projectId)) {
          set((state) => ({
            completedProjects: [...state.completedProjects, projectId],
            xp: state.xp + 500,
            lastStudied: new Date().toISOString(),
          }));
          if (completedProjects.length === 0) {
            get().unlockAchievement(INITIAL_ACHIEVEMENTS[5]);
          }
        }
      },

      markCertificationComplete: (certId) => {
        const { completedCertifications } = get();
        if (!completedCertifications.includes(certId)) {
          set((state) => ({
            completedCertifications: [...state.completedCertifications, certId],
            xp: state.xp + 1000,
            lastStudied: new Date().toISOString(),
          }));
        }
      },

      addBookmark: (id) => {
        set((state) => ({
          bookmarks: [...state.bookmarks.filter((b) => b !== id), id],
        }));
      },

      removeBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b !== id),
        }));
      },

      addNote: (topicId, content) => {
        const note = {
          id: Math.random().toString(36).substring(2, 9),
          topicId,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ notes: [...state.notes, note] }));
      },

      updateNote: (noteId, content) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
          ),
        }));
      },

      deleteNote: (noteId) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== noteId) }));
      },

      addXP: (amount) => {
        set((state) => ({ xp: state.xp + amount }));
      },

      incrementStreak: () => {
        set((state) => ({
          streak: state.streak + 1,
          lastStudied: new Date().toISOString(),
        }));
      },

      unlockAchievement: (achievement) => {
        const { achievements } = get();
        if (!achievements.find((a) => a.id === achievement.id)) {
          set((state) => ({
            achievements: [...state.achievements, { ...achievement, unlockedAt: new Date().toISOString() }],
            xp: state.xp + achievement.xpReward,
          }));
        }
      },

      updateQuizScore: (topicId, score) => {
        set((state) => ({
          quizScores: { ...state.quizScores, [topicId]: score },
        }));
        if (score === 100) {
          get().unlockAchievement(INITIAL_ACHIEVEMENTS[7]);
        }
      },

      addStudyTime: (minutes) => {
        set((state) => ({ studyTime: state.studyTime + minutes }));
      },

      isTopicComplete: (topicId) => get().completedTopics.includes(topicId),

      isBookmarked: (id) => get().bookmarks.includes(id),
    }),
    {
      name: 'azure-de-progress',
    }
  )
);
