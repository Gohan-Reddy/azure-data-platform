export interface Phase {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: Topic[];
  prerequisites: string[];
  color: string;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
  phase: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  tags: string[];
  subtopics: Subtopic[];
  resources: Resource[];
  interviewQuestions: InterviewQuestion[];
  codeExamples: CodeExample[];
  prerequisites: string[];
  objectives: string[];
  completed?: boolean;
}

export interface Subtopic {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  diagram?: string;
}

export interface Resource {
  title: string;
  url: string;
  type: 'docs' | 'video' | 'course' | 'github' | 'blog' | 'book' | 'lab' | 'practice';
  free: boolean;
  platform?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
}

export interface CodeExample {
  language: string;
  title: string;
  code: string;
  description?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  businessProblem: string;
  architecture: string;
  techStack: string[];
  duration: string;
  steps: ProjectStep[];
  resumePoints: string[];
  interviewQuestions: string[];
  enhancements: string[];
}

export interface ProjectStep {
  number: number;
  title: string;
  description: string;
  code?: string;
  language?: string;
}

export interface Certification {
  id: string;
  code: string;
  name: string;
  level: 'Fundamental' | 'Associate' | 'Expert';
  description: string;
  duration: string;
  price: number;
  topics: string[];
  studyPlan: StudyWeek[];
  sampleQuestions: InterviewQuestion[];
  tips: string[];
  resources: Resource[];
}

export interface StudyWeek {
  week: number;
  focus: string;
  topics: string[];
  tasks: string[];
}

export interface UserProgress {
  completedTopics: string[];
  completedProjects: string[];
  completedCertifications: string[];
  xp: number;
  streak: number;
  level: number;
  achievements: Achievement[];
  notes: Note[];
  bookmarks: string[];
  quizScores: Record<string, number>;
  studyTime: number;
  lastStudied: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  xpReward: number;
}

export interface Note {
  id: string;
  topicId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lab {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  objectives: string[];
  steps: LabStep[];
  prerequisites: string[];
  cleanup: string[];
  furtherChallenges: string[];
}

export interface LabStep {
  number: number;
  title: string;
  description: string;
  code?: string;
  language?: string;
  expectedOutput?: string;
  hint?: string;
  commonErrors?: string[];
}

export interface SearchResult {
  type: 'topic' | 'question' | 'project' | 'resource' | 'lab' | 'cheatsheet';
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
}
