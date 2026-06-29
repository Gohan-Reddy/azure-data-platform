'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ChevronDown, ChevronUp, Code2, Database, Cloud,
  Zap, GitBranch, Bookmark, BookmarkCheck, CheckCircle2, Circle,
  Brain, ArrowRight, Target, Clock, Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/store/progress';
import { SQL_QUESTIONS, SPARK_QUESTIONS, AZURE_QUESTIONS, ADF_QUESTIONS, SCENARIO_QUESTIONS, ALL_QUESTIONS } from '@/data/interview-questions';
import { getDifficultyBg, getProgressPercentage, cn } from '@/lib/utils';
import { InterviewQuestion } from '@/types';

const CATEGORIES = [
  { id: 'all', label: 'All Questions', count: ALL_QUESTIONS.length, icon: Brain, color: '#0078d4' },
  { id: 'sql', label: 'SQL', count: SQL_QUESTIONS.length, icon: Database, color: '#10b981' },
  { id: 'spark', label: 'Spark', count: SPARK_QUESTIONS.length, icon: Zap, color: '#f59e0b' },
  { id: 'azure', label: 'Azure Platform', count: AZURE_QUESTIONS.length, icon: Cloud, color: '#0078d4' },
  { id: 'adf', label: 'ADF', count: ADF_QUESTIONS.length, icon: GitBranch, color: '#8b5cf6' },
  { id: 'scenario', label: 'Scenario / System Design', count: SCENARIO_QUESTIONS.length, icon: Target, color: '#ef4444' },
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const CATEGORY_MAP: Record<string, InterviewQuestion[]> = {
  all: ALL_QUESTIONS,
  sql: SQL_QUESTIONS,
  spark: SPARK_QUESTIONS,
  azure: AZURE_QUESTIONS,
  adf: ADF_QUESTIONS,
  scenario: SCENARIO_QUESTIONS,
};

function QuestionCard({ question, index }: { question: InterviewQuestion; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [answered, setAnswered] = useState(false);
  const { isBookmarked, addBookmark, removeBookmark } = useProgressStore();
  const bookmarked = isBookmarked(question.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className={cn(
        'transition-all duration-200 border-border/50 hover:border-[#0078d4]/30',
        expanded && 'border-[#0078d4]/40 bg-[#0078d4]/2'
      )}>
        <div className="p-5">
          <div className="flex items-start gap-3">
            {/* Question number */}
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
              answered ? 'bg-green-500 text-white' : 'bg-secondary text-muted-foreground'
            )}>
              {answered ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3
                  className="font-medium cursor-pointer hover:text-[#0078d4] transition-colors leading-relaxed"
                  onClick={() => setExpanded(!expanded)}
                >
                  {question.question}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => bookmarked ? removeBookmark(question.id) : addBookmark(question.id)}
                    className="text-muted-foreground hover:text-[#0078d4] transition-colors"
                  >
                    {bookmarked ? <BookmarkCheck className="w-4 h-4 text-[#0078d4]" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={question.difficulty === 'Easy' ? 'success' : question.difficulty === 'Medium' ? 'warning' : 'danger'} className="border text-xs">
                  {question.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">{question.category}</Badge>
                {question.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <div className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                      Model Answer
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-line">{question.answer}</div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => setAnswered(!answered)}
                      className={cn(
                        'flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-all',
                        answered
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      )}
                    >
                      {answered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      {answered ? 'Marked as Answered' : 'Mark as Answered'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

export default function InterviewPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { bookmarks } = useProgressStore();

  const filteredQuestions = useMemo(() => {
    let questions = CATEGORY_MAP[selectedCategory] || ALL_QUESTIONS;

    if (selectedDifficulty !== 'All') {
      questions = questions.filter(q => q.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      questions = questions.filter(q =>
        q.question.toLowerCase().includes(lower) ||
        q.answer.toLowerCase().includes(lower) ||
        q.category.toLowerCase().includes(lower) ||
        q.tags.some(t => t.includes(lower))
      );
    }

    return questions;
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const stats = {
    easy: ALL_QUESTIONS.filter(q => q.difficulty === 'Easy').length,
    medium: ALL_QUESTIONS.filter(q => q.difficulty === 'Medium').length,
    hard: ALL_QUESTIONS.filter(q => q.difficulty === 'Hard').length,
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">300+ Questions</Badge>
          <h1 className="text-5xl font-bold mb-4">
            Interview <span className="azure-gradient-text">Question Bank</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Curated interview questions with detailed answers across SQL, Spark, Azure, ADF, Databricks, and Synapse.
            Filtered by difficulty, category, and topic.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Easy', count: stats.easy, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
            { label: 'Medium', count: stats.medium, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
            { label: 'Hard', count: stats.hard, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} ${s.border} border rounded-xl p-4 text-center`}>
              <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions, answers, tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0078d4] focus:border-[#0078d4] transition-all"
            />
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {DIFFICULTIES.map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
                  selectedDifficulty === diff
                    ? 'bg-[#0078d4] text-white border-[#0078d4]'
                    : 'border-border text-muted-foreground hover:border-[#0078d4]/40 hover:text-foreground'
                )}
              >
                {diff}
              </button>
            ))}
            <div className="ml-auto text-sm text-muted-foreground">
              {filteredQuestions.length} questions
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left',
                      selectedCategory === cat.id
                        ? 'border-[#0078d4]/40 bg-[#0078d4]/10 text-[#0078d4]'
                        : 'border-border hover:border-[#0078d4]/30 hover:bg-secondary/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" style={{ color: selectedCategory === cat.id ? cat.color : undefined }} />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      selectedCategory === cat.id ? 'bg-[#0078d4]/20 text-[#0078d4]' : 'bg-secondary text-muted-foreground'
                    )}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Interview tips box */}
              <div className="mt-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-purple-400">
                  <Brain className="w-4 h-4" />
                  Interview Tips
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• Structure answers with Context → Problem → Solution</li>
                  <li>• Always mention trade-offs, not just the solution</li>
                  <li>• Reference real production scenarios when possible</li>
                  <li>• Draw architecture diagrams when asked system design</li>
                  <li>• Practice explaining out loud, not just reading</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="lg:col-span-3">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No questions found</h3>
                <p className="text-muted-foreground">Try a different search term or category</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((question, i) => (
                  <QuestionCard key={question.id} question={question} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
