'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Clock, ArrowRight, CheckCircle2, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useProgressStore } from '@/store/progress';
import { PHASES } from '@/data/roadmap';
import { getDifficultyBg, cn } from '@/lib/utils';

export default function LearnIndexPage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const { isTopicComplete } = useProgressStore();

  const allTopics = PHASES.flatMap(phase =>
    phase.topics.map(topic => ({ ...topic, phaseTitle: phase.title, phaseColor: phase.color, phaseNumber: phase.number }))
  );

  const filtered = allTopics.filter(topic =>
    (difficulty === 'All' || topic.difficulty === difficulty) &&
    (!search || topic.title.toLowerCase().includes(search.toLowerCase()) ||
     topic.description.toLowerCase().includes(search.toLowerCase()) ||
     topic.tags.some(t => t.includes(search.toLowerCase())))
  );

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">All Learning <span className="azure-gradient-text">Topics</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {allTopics.length}+ topics covering every Azure Data Engineering concept from beginner to advanced.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topics, descriptions, tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0078d4] transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm border transition-all',
                  difficulty === d ? 'bg-[#0078d4] text-white border-[#0078d4]' : 'border-border text-muted-foreground hover:border-[#0078d4]/30'
                )}
              >{d}</button>
            ))}
            <div className="ml-auto text-sm text-muted-foreground self-center">{filtered.length} topics</div>
          </div>
        </div>

        {/* Phase groups */}
        {!search && difficulty === 'All' ? (
          <div className="space-y-10">
            {PHASES.map((phase, pi) => (
              <motion.div key={phase.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: pi * 0.05 }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg text-white font-bold text-sm flex items-center justify-center shrink-0" style={{ background: phase.color }}>
                    {phase.number}
                  </div>
                  <h2 className="text-xl font-bold">{phase.title}</h2>
                  <span className="text-sm text-muted-foreground ml-auto">{phase.topics.length} topics · {phase.duration}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phase.topics.map((topic, ti) => {
                    const complete = isTopicComplete(topic.id);
                    return (
                      <motion.div key={topic.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ti * 0.05 }} whileHover={{ y: -2 }}>
                        <Link href={`/learn/${topic.slug}`}>
                          <Card className={cn('h-full card-hover cursor-pointer border-border/50 hover:border-[#0078d4]/30', complete && 'border-[#0078d4]/30 bg-[#0078d4]/3')}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <Badge variant={topic.difficulty === 'Beginner' ? 'success' : topic.difficulty === 'Intermediate' ? 'warning' : 'danger'} className="border text-xs">
                                  {topic.difficulty}
                                </Badge>
                                {complete && <CheckCircle2 className="w-4 h-4 text-[#0078d4]" />}
                              </div>
                              <h3 className="font-semibold text-sm mb-1.5">{topic.title}</h3>
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{topic.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />{topic.estimatedTime}
                                <ArrowRight className="w-3 h-3 ml-auto text-[#0078d4]" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((topic, i) => {
              const complete = isTopicComplete(topic.id);
              return (
                <motion.div key={topic.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -2 }}>
                  <Link href={`/learn/${topic.slug}`}>
                    <Card className={cn('h-full card-hover cursor-pointer', complete && 'border-[#0078d4]/30 bg-[#0078d4]/3')}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded text-white text-xs font-bold flex items-center justify-center shrink-0" style={{ background: topic.phaseColor }}>
                            {topic.phaseNumber}
                          </div>
                          <span className="text-xs text-muted-foreground truncate">{topic.phaseTitle}</span>
                          {complete && <CheckCircle2 className="w-4 h-4 text-[#0078d4] ml-auto" />}
                        </div>
                        <h3 className="font-semibold text-sm mb-1.5">{topic.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{topic.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={topic.difficulty === 'Beginner' ? 'success' : topic.difficulty === 'Intermediate' ? 'warning' : 'danger'} className="border text-xs">
                            {topic.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                            <Clock className="w-3 h-3" />{topic.estimatedTime}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
