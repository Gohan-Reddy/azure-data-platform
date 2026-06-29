'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Zap, Clock, Tag, ArrowRight, CheckCircle2, Circle, GitBranch,
  Star, ExternalLink, Code2, Briefcase, ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProgressStore } from '@/store/progress';
import { PROJECTS } from '@/data/projects';
import { cn } from '@/lib/utils';

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const LEVEL_COLORS = {
  Beginner: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  Intermediate: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  Advanced: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

export default function ProjectsPage() {
  const [filter, setFilter] = useState('All');
  const { completedProjects, markProjectComplete } = useProgressStore();

  const filtered = filter === 'All' ? PROJECTS : PROJECTS.filter(p => p.level === filter);

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">10 Projects</Badge>
          <h1 className="text-5xl font-bold mb-4">
            End-to-End <span className="azure-gradient-text">Projects</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Production-grade projects from beginner to advanced. Each comes with architecture, code,
            resume points, and interview questions to help you land the job.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Beginner', count: PROJECTS.filter(p => p.level === 'Beginner').length, color: 'text-green-400' },
            { label: 'Intermediate', count: PROJECTS.filter(p => p.level === 'Intermediate').length, color: 'text-yellow-400' },
            { label: 'Advanced', count: PROJECTS.filter(p => p.level === 'Advanced').length, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-5 text-center">
              <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.count}</div>
              <div className="text-sm text-muted-foreground">{s.label} Projects</div>
            </div>
          ))}
        </motion.div>

        {/* Filter */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center gap-3 mb-8 flex-wrap">
          {LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium border transition-all',
                filter === level
                  ? 'bg-[#0078d4] text-white border-[#0078d4]'
                  : 'border-border text-muted-foreground hover:border-[#0078d4]/30 hover:text-foreground'
              )}
            >
              {level}
            </button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => {
            const isComplete = completedProjects.includes(project.id);
            const colors = LEVEL_COLORS[project.level];

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className={cn(
                  'h-full card-hover border-border/50 overflow-hidden',
                  isComplete && 'border-[#0078d4]/30 bg-[#0078d4]/2'
                )}>
                  {/* Project header */}
                  <div className="h-2 w-full" style={{
                    background: project.level === 'Beginner' ? 'linear-gradient(90deg, #10b981, #06d6a0)' :
                               project.level === 'Intermediate' ? 'linear-gradient(90deg, #f59e0b, #fb923c)' :
                               'linear-gradient(90deg, #ef4444, #e879f9)'
                  }} />

                  <CardContent className="p-6">
                    {/* Level & status */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${colors.bg} ${colors.text} ${colors.border} border text-xs`}>
                        {project.level}
                      </Badge>
                      <button
                        onClick={() => markProjectComplete(project.id)}
                        className="text-muted-foreground hover:text-[#0078d4] transition-colors"
                      >
                        {isComplete
                          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                          : <Circle className="w-5 h-5" />
                        }
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg mb-2 leading-tight">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">{project.description}</p>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.techStack.slice(0, 4).map(tech => (
                        <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="w-3.5 h-3.5" />
                      {project.duration}
                    </div>

                    {/* Resume points preview */}
                    <div className="mb-5">
                      <div className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />Resume Highlights
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{project.resumePoints[0]}</p>
                    </div>

                    <Link href={`/projects/${project.slug}`}>
                      <Button variant="gradient" className="w-full group">
                        View Project
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
            <GitBranch className="w-12 h-12 text-[#0078d4] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Build Your Portfolio on GitHub</h2>
            <p className="text-muted-foreground mb-6">
              Each project comes with a complete GitHub README template, architecture diagrams,
              and resume bullet points to make your portfolio stand out.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="gradient" size="lg">
                <Code2 className="w-4 h-4" />
                Start First Project
              </Button>
              <Link href="/resources">
                <Button variant="outline" size="lg">
                  Free Azure Credits
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
