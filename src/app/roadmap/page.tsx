'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, ArrowRight,
  BookOpen, Code2, Zap, Lock, Target
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useProgressStore } from '@/store/progress';
import { PHASES } from '@/data/roadmap';
import { getDifficultyBg, getProgressPercentage } from '@/lib/utils';

export default function RoadmapPage() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>('phase-1');
  const { completedTopics, markTopicComplete, markTopicIncomplete, isTopicComplete } = useProgressStore();

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-5xl mx-auto py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">10 Phases</Badge>
          <h1 className="text-5xl font-bold mb-4">
            Azure DE Learning <span className="azure-gradient-text">Roadmap</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A structured, dependency-aware journey from beginner to Senior Azure Data Engineer.
            Most learners reach interview-readiness in 6-9 months of consistent effort (~2 hrs/day).
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-green-500" />Beginner
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />Intermediate
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-red-500" />Advanced
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-[#0078d4]" />Completed
            </div>
          </div>
        </motion.div>

        {/* Overall progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-lg">Overall Roadmap Progress</h3>
                <p className="text-sm text-muted-foreground">{completedTopics.length} topics completed</p>
              </div>
              <div className="text-3xl font-bold azure-gradient-text">
                {getProgressPercentage(completedTopics.length, PHASES.reduce((a, p) => a + p.topics.length, 0))}%
              </div>
            </div>
            <Progress value={getProgressPercentage(completedTopics.length, PHASES.reduce((a, p) => a + p.topics.length, 0))} className="h-3" />
            <div className="grid grid-cols-5 gap-2 mt-4">
              {PHASES.map(phase => {
                const completed = phase.topics.filter(t => completedTopics.includes(t.id)).length;
                const pct = getProgressPercentage(completed, phase.topics.length);
                return (
                  <div key={phase.id} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">P{phase.number}</div>
                    <div className="h-1 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: phase.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Phases */}
        <div className="space-y-4">
          {PHASES.map((phase, phaseIndex) => {
            const isExpanded = expandedPhase === phase.id;
            const completedInPhase = phase.topics.filter(t => completedTopics.includes(t.id)).length;
            const phasePct = getProgressPercentage(completedInPhase, phase.topics.length);
            const isLocked = phaseIndex > 0 && PHASES[phaseIndex - 1].topics.filter(t => completedTopics.includes(t.id)).length < Math.floor(PHASES[phaseIndex - 1].topics.length * 0.3);

            return (
              <motion.div
                key={phase.id}
                id={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: phaseIndex * 0.08 }}
              >
                <div
                  className="rounded-2xl border transition-all duration-300 overflow-hidden"
                  style={{
                    borderColor: isExpanded ? phase.color + '60' : 'var(--border)',
                    boxShadow: isExpanded ? `0 0 30px ${phase.color}15` : 'none'
                  }}
                >
                  {/* Phase Header */}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                    className="w-full text-left"
                  >
                    <div className="p-5 flex items-center gap-4">
                      {/* Phase number */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ background: phase.color }}
                      >
                        {phase.number}
                      </div>

                      {/* Phase info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-lg">{phase.title}</h3>
                          <Badge className={getDifficultyBg(phase.difficulty) + ' border text-xs'}>
                            {phase.difficulty}
                          </Badge>
                          {phasePct === 100 && (
                            <Badge variant="success" className="text-xs border">✓ Complete</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{phase.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />{phase.duration}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {completedInPhase}/{phase.topics.length} topics
                          </span>
                        </div>
                      </div>

                      {/* Progress ring */}
                      <div className="shrink-0 flex items-center gap-3">
                        <div className="hidden sm:block w-24">
                          <div className="text-xs text-muted-foreground text-right mb-1">{phasePct}%</div>
                          <Progress value={phasePct} className="h-1.5" />
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>
                  </button>

                  {/* Topics */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border p-5">
                          <p className="text-sm text-muted-foreground mb-5">{phase.description}</p>

                          {phase.prerequisites.length > 0 && (
                            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                              <Lock className="w-3 h-3" />
                              Prerequisites: {phase.prerequisites.join(', ')}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {phase.topics.map((topic) => {
                              const isComplete = isTopicComplete(topic.id);
                              return (
                                <div
                                  key={topic.id}
                                  className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                                    isComplete
                                      ? 'border-[#0078d4]/30 bg-[#0078d4]/5'
                                      : 'border-border hover:border-[#0078d4]/30 bg-background/50 hover:bg-[#0078d4]/5'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <button
                                      onClick={() => isComplete ? markTopicIncomplete(topic.id) : markTopicComplete(topic.id)}
                                      className="shrink-0 mt-0.5"
                                    >
                                      {isComplete ? (
                                        <CheckCircle2 className="w-5 h-5 text-[#0078d4]" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-border hover:text-[#0078d4] transition-colors" />
                                      )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm mb-1">{topic.title}</h4>
                                      <p className="text-xs text-muted-foreground mb-2 leading-relaxed line-clamp-2">{topic.description}</p>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyBg(topic.difficulty)}`}>
                                          {topic.difficulty}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock className="w-3 h-3" />{topic.estimatedTime}
                                        </span>
                                      </div>
                                    </div>
                                    <Link href={`/learn/${topic.slug}`} className="shrink-0">
                                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2">
                                        <ArrowRight className="w-3 h-3" />
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-5 flex items-center justify-between">
                            <Link href={`/learn/${phase.topics[0]?.slug || '#'}`}>
                              <Button variant="gradient" size="sm">
                                <BookOpen className="w-4 h-4" />
                                Start Phase {phase.number}
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                            {completedInPhase === phase.topics.length && (
                              <Badge variant="success" className="border">Phase Complete! 🎉</Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Connector line */}
                {phaseIndex < PHASES.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-px h-8 bg-gradient-to-b from-border to-transparent" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Study Plans */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Study Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: '3-Month Crash Plan', subtitle: 'Working Pro, Aggressive', color: '#ef4444', weeks: ['Month 1: Foundations (Python, SQL, Azure basics)', 'Month 2: Spark + Databricks + Synapse', 'Month 3: Real-time, CI/CD, Certs, Interviews'], commitment: '2-3 hrs/day' },
              { title: '6-Month Balanced Plan', subtitle: 'Self-paced, Beginner+', color: '#f59e0b', weeks: ['Month 1-2: Foundations', 'Month 3-4: Core Engineering', 'Month 5: Advanced + Projects', 'Month 6: Certs + Interviews'], commitment: '1-2 hrs/day' },
              { title: '12-Month Deep Plan', subtitle: 'Career Switcher, Foundational', color: '#10b981', weeks: ['Q1: Foundations (Python, SQL, Azure)', 'Q2: Core DE (ADF, ADLS, Spark)', 'Q3: Advanced (Databricks, Streaming)', 'Q4: Projects, Certs, Job Hunting'], commitment: '45 min-1 hr/day' },
            ].map((plan) => (
              <Card key={plan.title} className="card-hover border-border/50">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: plan.color + '20' }}>
                    <Target className="w-5 h-5" style={{ color: plan.color }} />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{plan.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.subtitle}</p>
                  <ul className="space-y-2">
                    {plan.weeks.map((week, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="w-3 h-3 shrink-0 mt-0.5" style={{ color: plan.color }} />
                        {week}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {plan.commitment}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
