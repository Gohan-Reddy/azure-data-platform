'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Trophy, BookOpen, Clock, Target, Flame, Star, Award, CheckCircle2,
  TrendingUp, Map, Code2, Zap, ArrowRight, Calendar, BarChart3,
  Brain, BookMarked, Sparkles, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/store/progress';
import { PHASES, TOTAL_TOPICS } from '@/data/roadmap';
import { getLevel, getProgressPercentage, getDifficultyBg } from '@/lib/utils';

const LEADERBOARD = [
  { rank: 1, name: 'Rahul Gupta', xp: 15420, level: 7, country: '🇮🇳' },
  { rank: 2, name: 'Sarah Chen', xp: 12890, level: 6, country: '🇺🇸' },
  { rank: 3, name: 'Ahmed Hassan', xp: 11200, level: 6, country: '🇦🇪' },
  { rank: 4, name: 'You', xp: 0, level: 1, country: '⭐', isYou: true },
  { rank: 5, name: 'Maria Santos', xp: 8900, level: 5, country: '🇧🇷' },
];

const DAILY_GOALS = [
  { label: 'Study 30 minutes', completed: false, xp: 50 },
  { label: 'Complete 1 topic', completed: false, xp: 100 },
  { label: 'Answer 5 interview questions', completed: false, xp: 75 },
  { label: 'Review flashcards', completed: false, xp: 25 },
];

export default function DashboardPage() {
  const { xp, completedTopics, completedProjects, streak, achievements, studyTime, bookmarks, notes } = useProgressStore();
  const levelInfo = getLevel(xp);
  const overallProgress = getProgressPercentage(completedTopics.length, TOTAL_TOPICS);
  const interviewReadiness = Math.min(100, Math.round((completedTopics.length / TOTAL_TOPICS) * 100 + completedProjects.length * 5));
  const certReadiness = Math.min(100, Math.round((completedTopics.length / TOTAL_TOPICS) * 80));
  const nextLevelXP = levelInfo.nextXP === Infinity ? xp + 10000 : levelInfo.nextXP;
  const levelProgress = getProgressPercentage(xp - (levelInfo.level > 1 ? [0, 0, 500, 1500, 3000, 5000, 8000, 12000, 18000, 25000][levelInfo.level - 1] : 0), nextLevelXP - (levelInfo.level > 1 ? [0, 0, 500, 1500, 3000, 5000, 8000, 12000, 18000, 25000][levelInfo.level - 1] : 0));

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Your Learning Dashboard</h1>
              <p className="text-muted-foreground">Track your Azure Data Engineering journey</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{streak}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{xp.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">XP Points</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="relative overflow-hidden rounded-2xl azure-gradient p-6 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
                  {levelInfo.level}
                </div>
                <div>
                  <p className="text-white/70 text-sm">Current Level</p>
                  <h2 className="text-2xl font-bold">{levelInfo.title}</h2>
                  <p className="text-white/70 text-sm mt-1">
                    {levelInfo.nextXP === Infinity ? 'MAX LEVEL' : `${(nextLevelXP - xp).toLocaleString()} XP to Level ${levelInfo.level + 1}`}
                  </p>
                </div>
              </div>
              <div className="flex-1 min-w-[200px] max-w-xs">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">{xp.toLocaleString()} XP</span>
                  <span className="text-white/70">{nextLevelXP === Infinity ? '∞' : nextLevelXP.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Overall Progress', value: `${overallProgress}%`, icon: TrendingUp, color: 'text-blue-400', sub: `${completedTopics.length}/${TOTAL_TOPICS} topics` },
            { label: 'Study Time', value: `${Math.floor(studyTime / 60)}h`, icon: Clock, color: 'text-purple-400', sub: `${studyTime} minutes total` },
            { label: 'Projects Done', value: completedProjects.length.toString(), icon: Zap, color: 'text-green-400', sub: 'of 10 projects' },
            { label: 'Achievements', value: achievements.length.toString(), icon: Award, color: 'text-yellow-400', sub: 'badges earned' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="card-hover">
                <CardContent className="p-5">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Progress */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Roadmap Progress</CardTitle>
                    <Link href="/roadmap"><Button variant="ghost" size="sm" className="text-[#0078d4]">View Roadmap <ArrowRight className="w-3 h-3" /></Button></Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PHASES.map((phase) => {
                    const phaseCompleted = phase.topics.filter(t => completedTopics.includes(t.id)).length;
                    const pct = getProgressPercentage(phaseCompleted, phase.topics.length);
                    return (
                      <div key={phase.id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded text-white text-xs font-bold flex items-center justify-center" style={{ background: phase.color }}>
                              {phase.number}
                            </div>
                            <span className="text-sm font-medium">{phase.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{phaseCompleted}/{phase.topics.length}</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Interview & Cert Readiness */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5">
                  <Code2 className="w-5 h-5 text-green-400 mb-3" />
                  <div className="text-sm font-medium mb-2">Interview Readiness</div>
                  <div className="text-3xl font-bold text-green-400 mb-2">{interviewReadiness}%</div>
                  <Progress value={interviewReadiness} indicatorClassName="from-green-400 to-emerald-500" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {interviewReadiness < 50 ? 'Keep learning!' : interviewReadiness < 80 ? 'Getting there!' : 'Ready to interview!'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <Award className="w-5 h-5 text-yellow-400 mb-3" />
                  <div className="text-sm font-medium mb-2">Cert Readiness</div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{certReadiness}%</div>
                  <Progress value={certReadiness} indicatorClassName="from-yellow-400 to-orange-500" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {certReadiness < 60 ? 'Study more topics first' : 'Ready for DP-900!'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Continue Learning */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Continue Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {PHASES.slice(0, 3).map(phase => (
                      <Link key={phase.id} href={`/learn/${phase.topics[0]?.slug || '#'}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0" style={{ background: phase.color }}>
                            {phase.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{phase.title}</div>
                            <div className="text-xs text-muted-foreground">{phase.topics.length} topics · {phase.duration}</div>
                          </div>
                          <Badge variant={phase.difficulty === 'Beginner' ? 'success' : phase.difficulty === 'Intermediate' ? 'warning' : 'danger'} className="text-xs shrink-0">
                            {phase.difficulty}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/roadmap">
                    <Button variant="outline" className="w-full mt-4">View Full Roadmap</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Daily Goals */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#0078d4]" />
                    <CardTitle className="text-lg">Daily Goals</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {DAILY_GOALS.map((goal, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${goal.completed ? 'bg-green-500 border-green-500' : 'border-border'}`}>
                        {goal.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm flex-1 ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>{goal.label}</span>
                      <Badge variant="outline" className="text-xs">+{goal.xp} XP</Badge>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Daily Progress</span>
                      <span>0/4</span>
                    </div>
                    <Progress value={0} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <CardTitle className="text-lg">Leaderboard</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {LEADERBOARD.map((entry) => (
                    <div key={entry.rank} className={`flex items-center gap-3 p-2 rounded-lg ${entry.isYou ? 'bg-[#0078d4]/10 border border-[#0078d4]/20' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${entry.rank === 1 ? 'bg-yellow-500 text-white' : entry.rank === 2 ? 'bg-slate-400 text-white' : entry.rank === 3 ? 'bg-amber-600 text-white' : 'bg-secondary text-muted-foreground'}`}>
                        {entry.rank}
                      </div>
                      <span className="text-sm">{entry.country}</span>
                      <span className={`text-sm flex-1 font-medium ${entry.isYou ? 'text-[#0078d4]' : ''}`}>{entry.name}</span>
                      <span className="text-xs text-muted-foreground">{entry.isYou ? `${xp.toLocaleString()} XP` : `${entry.xp.toLocaleString()} XP`}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Access</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Roadmap', href: '/roadmap', icon: Map, color: 'text-blue-400' },
                    { label: 'Interview', href: '/interview', icon: Code2, color: 'text-green-400' },
                    { label: 'Projects', href: '/projects', icon: Zap, color: 'text-orange-400' },
                    { label: 'Certs', href: '/certifications', icon: Award, color: 'text-purple-400' },
                    { label: 'Labs', href: '/labs', icon: Brain, color: 'text-pink-400' },
                    { label: 'Resources', href: '/resources', icon: BookOpen, color: 'text-teal-400' },
                  ].map((action) => (
                    <Link key={action.href} href={action.href}>
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary/50 hover:border-[#0078d4]/30 transition-all cursor-pointer group">
                        <action.icon className={`w-4 h-4 ${action.color}`} />
                        <span className="text-sm font-medium">{action.label}</span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <CardTitle className="text-lg">Recent Achievements</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {achievements.slice(0, 3).map((a) => (
                      <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                        <span className="text-2xl">{a.icon}</span>
                        <div>
                          <div className="text-sm font-medium">{a.title}</div>
                          <div className="text-xs text-muted-foreground">{a.description}</div>
                        </div>
                        <Badge variant="warning" className="text-xs ml-auto">+{a.xpReward} XP</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
