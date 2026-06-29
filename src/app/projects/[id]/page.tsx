'use client';

import { useState } from 'react';
import { use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, Circle, Copy, Check, Clock, Code2,
  Briefcase, HelpCircle, Zap, ChevronRight, GitBranch, Star,
  Target, Database, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProgressStore } from '@/store/progress';
import { PROJECTS } from '@/data/projects';
import { cn } from '@/lib/utils';

function CodeBlock({ code, language, title }: { code: string; language: string; title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="code-block rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <span className="text-sm font-medium text-white">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-[#0d1117] px-2 py-0.5 rounded">{language}</span>
          <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto text-sm"><code className="text-gray-300 font-mono">{code}</code></pre>
    </div>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = PROJECTS.find(p => p.slug === id);
  const [activeStep, setActiveStep] = useState(0);
  const { completedProjects, markProjectComplete } = useProgressStore();
  const isComplete = project ? completedProjects.includes(project.id) : false;

  if (!project) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link href="/projects"><Button>Browse All Projects</Button></Link>
        </div>
      </div>
    );
  }

  const levelColor = project.level === 'Beginner' ? '#10b981' : project.level === 'Intermediate' ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-5xl mx-auto py-8">
        {/* Back */}
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Projects
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className="text-xs border" style={{ background: levelColor + '20', color: levelColor, borderColor: levelColor + '40' }}>
                  {project.level}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />{project.duration}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-3">{project.title}</h1>
              <p className="text-lg text-muted-foreground">{project.description}</p>
            </div>
            <button
              onClick={() => markProjectComplete(project.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm transition-all',
                isComplete ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'border-border hover:border-[#0078d4]/30 hover:bg-[#0078d4]/5'
              )}
            >
              {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              {isComplete ? 'Completed' : 'Mark Complete'}
            </button>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {project.techStack.map(tech => (
              <span key={tech} className="px-3 py-1 rounded-full bg-[#0078d4]/10 text-[#0078d4] text-sm border border-[#0078d4]/20">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Problem */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h2 className="font-bold text-xl mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#0078d4]" />Business Problem
                </h2>
                <p className="text-muted-foreground leading-relaxed">{project.businessProblem}</p>
              </CardContent>
            </Card>

            {/* Architecture */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" />Architecture
                </h2>
                <div className="bg-secondary/30 rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {project.architecture.split('→').map((step, i, arr) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-lg bg-background border border-border font-medium text-xs">
                          {step.trim()}
                        </span>
                        {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Implementation Steps */}
            <div>
              <h2 className="font-bold text-xl mb-5 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />Implementation Guide
              </h2>
              <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                {project.steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all shrink-0',
                      activeStep === i
                        ? 'bg-[#0078d4] text-white border-[#0078d4]'
                        : 'border-border text-muted-foreground hover:border-[#0078d4]/30 hover:text-foreground'
                    )}
                  >
                    <span className="w-5 h-5 rounded-full bg-current/20 text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    Step {i + 1}
                  </button>
                ))}
              </div>

              {project.steps[activeStep] && (
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-[#0078d4]/20">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">Step {project.steps[activeStep].number}: {project.steps[activeStep].title}</h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{project.steps[activeStep].description}</p>
                      {project.steps[activeStep].code && (
                        <CodeBlock
                          code={project.steps[activeStep].code!}
                          language={project.steps[activeStep].language || 'code'}
                          title={`Step ${activeStep + 1} Code`}
                        />
                      )}
                    </CardContent>
                  </Card>
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>
                      <ArrowLeft className="w-4 h-4" />Previous
                    </Button>
                    <Button onClick={() => setActiveStep(Math.min(project.steps.length - 1, activeStep + 1))} disabled={activeStep === project.steps.length - 1}>
                      Next<ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resume Points */}
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#0078d4]" />Resume Bullet Points
                </h3>
                <div className="space-y-3">
                  {project.resumePoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interview Questions */}
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400" />Interview Questions
                </h3>
                <div className="space-y-2">
                  {project.interviewQuestions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{q}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhancements */}
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />Possible Enhancements
                </h3>
                <div className="space-y-2">
                  {project.enhancements.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{e}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* GitHub CTA */}
            <div className="p-5 rounded-xl bg-[#0d1117] border border-[#30363d]">
              <GitBranch className="w-8 h-8 text-white mb-3" />
              <h3 className="font-bold text-white mb-2">Push to GitHub</h3>
              <p className="text-sm text-gray-400 mb-4">
                Include this project in your portfolio with the template README and architecture diagram.
              </p>
              <Button variant="outline" className="w-full border-[#30363d] text-white hover:bg-white/10">
                View README Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
