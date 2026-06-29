'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import {
  Cloud, ArrowRight, BookOpen, Trophy, Code2, Zap, Map, Award, Star,
  ChevronRight, Play, Clock, Brain, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PHASES, TOTAL_TOPICS } from '@/data/roadmap';

const STATS = [
  { value: '10', label: 'Learning Phases', icon: Map, color: 'text-blue-400' },
  { value: TOTAL_TOPICS.toString() + '+', label: 'Topics Covered', icon: BookOpen, color: 'text-purple-400' },
  { value: '300+', label: 'Interview Questions', icon: Code2, color: 'text-green-400' },
  { value: '10', label: 'End-to-End Projects', icon: Zap, color: 'text-orange-400' },
  { value: '4', label: 'Certifications', icon: Award, color: 'text-pink-400' },
  { value: '100%', label: 'Free Platform', icon: Star, color: 'text-yellow-400' },
];

const TECH_STACK = [
  { name: 'Azure Data Factory', icon: '🔄' },
  { name: 'ADLS Gen2', icon: '🏔️' },
  { name: 'Azure Databricks', icon: '⚡' },
  { name: 'Delta Lake', icon: '🔱' },
  { name: 'Apache Spark', icon: '🔥' },
  { name: 'Azure Synapse', icon: '🎯' },
  { name: 'Event Hubs', icon: '📡' },
  { name: 'Microsoft Purview', icon: '🛡️' },
  { name: 'Power BI', icon: '📊' },
  { name: 'Azure DevOps', icon: '🚀' },
  { name: 'Terraform', icon: '🏗️' },
  { name: 'Python', icon: '🐍' },
];

const FEATURES = [
  { icon: Map, title: 'Interactive Roadmap', description: '10-phase guided learning path from beginner to Senior Azure Data Engineer.', color: 'from-blue-500 to-cyan-500' },
  { icon: BookOpen, title: 'Deep Topic Coverage', description: 'Every concept explained with diagrams, code examples, and real-world use cases.', color: 'from-purple-500 to-pink-500' },
  { icon: Code2, title: '300+ Interview Questions', description: 'Curated question banks with detailed answers for SQL, Spark, ADF, Databricks, and Azure.', color: 'from-orange-500 to-red-500' },
  { icon: Zap, title: 'Hands-on Labs', description: 'Step-by-step labs with objectives, expected outputs, hints, and cleanup instructions.', color: 'from-green-500 to-teal-500' },
  { icon: Trophy, title: 'Gamified Learning', description: 'XP, achievements, streaks, and leaderboards to keep you motivated and on track.', color: 'from-yellow-500 to-orange-500' },
  { icon: Brain, title: 'AI Learning Assistant', description: 'Built-in AI tutor to explain concepts, generate quizzes, and simulate interviews.', color: 'from-pink-500 to-purple-500' },
];

const CERTIFICATIONS = [
  { code: 'DP-203', name: 'Data Engineering', level: 'Associate', color: '#0078d4' },
  { code: 'AZ-900', name: 'Azure Fundamentals', level: 'Fundamental', color: '#0078d4' },
  { code: 'DP-900', name: 'Data Fundamentals', level: 'Fundamental', color: '#0078d4' },
  { code: 'AI-900', name: 'AI Fundamentals', level: 'Fundamental', color: '#7719aa' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Data Engineer at Microsoft', avatar: 'PS', text: 'This platform helped me crack DP-203 on the first attempt. The interview question bank is absolute gold!', rating: 5 },
  { name: 'Marcus Johnson', role: 'Senior DE at Accenture', avatar: 'MJ', text: 'The Spark optimization section alone is worth its weight in gold. I went from 6-hour jobs to 45 minutes.', rating: 5 },
  { name: 'Aisha Rahman', role: 'Cloud DE at Deloitte', avatar: 'AR', text: 'The medallion architecture project was exactly what I needed. Got 3 job offers within a month of completing it.', rating: 5 },
];

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <main>
      {/* Hero */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden" ref={heroRef}>
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <motion.div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#0078d4]/10 blur-3xl" animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" animate={{ x: [0, -30, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0078d4]/30 bg-[#0078d4]/10 text-[#0078d4] text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            2026 Edition · Azure Data Engineering Bible
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Master <span className="azure-gradient-text">Azure Data</span><br />Engineering
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The complete industry-grade learning platform. 10 phases, {TOTAL_TOPICS}+ topics, 300+ interview questions, 10 production projects, 4 certification paths.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/roadmap"><Button size="xl" variant="gradient" className="group">Start Learning Free<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Button></Link>
            <Link href="/dashboard"><Button size="xl" variant="outline"><Play className="w-5 h-5" />View Dashboard</Button></Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }} className="glass rounded-xl p-4 text-center">
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Roadmap Preview */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">Learning Path</Badge>
            <h2 className="text-4xl font-bold mb-4">10 Phases to Azure DE Mastery</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A structured, dependency-aware journey. Most learners reach interview-readiness in 6-9 months.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {PHASES.map((phase, i) => (
              <motion.div key={phase.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                <Link href={`/roadmap#${phase.id}`}>
                  <div className="h-full rounded-xl p-4 border transition-all duration-300 cursor-pointer card-hover" style={{ borderColor: phase.color + '30', background: `linear-gradient(135deg, ${phase.color}10, ${phase.color}05)` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold mb-3" style={{ background: phase.color }}>{phase.number}</div>
                    <h3 className="font-semibold text-sm mb-2 leading-tight">{phase.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><Clock className="w-3 h-3" />{phase.duration}</div>
                    <Badge variant={phase.difficulty === 'Beginner' ? 'success' : phase.difficulty === 'Intermediate' ? 'warning' : 'danger'} className="text-xs">{phase.difficulty}</Badge>
                    <div className="mt-3 text-xs text-muted-foreground">{phase.topics.length} topics</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
            <Link href="/roadmap"><Button variant="outline" size="lg" className="group">Explore Full Roadmap<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Button></Link>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">Technologies</Badge>
            <h2 className="text-4xl font-bold mb-4">Every Azure Data Service Covered</h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH_STACK.map((tech, i) => (
              <motion.div key={tech.name} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05, y: -2 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background/50 backdrop-blur-sm">
                <span className="text-xl">{tech.icon}</span>
                <span className="text-sm font-medium">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">Platform Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                <Card className="h-full card-hover border-border/50 bg-background/50">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}><feature.icon className="w-6 h-6 text-white" /></div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-24 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">Certifications</Badge>
            <h2 className="text-4xl font-bold mb-4">Ace Every Microsoft Certification</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CERTIFICATIONS.map((cert, i) => (
              <motion.div key={cert.code} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }}>
                <Link href={`/certifications/${cert.code.toLowerCase()}`}>
                  <Card className="h-full text-center cursor-pointer card-hover border-[#0078d4]/20 hover:border-[#0078d4]/50 bg-background/50">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-sm shadow-lg" style={{ background: `linear-gradient(135deg, ${cert.color}, ${cert.color}99)` }}>{cert.code}</div>
                      <Badge variant="outline" className="mb-3 text-xs">{cert.level}</Badge>
                      <h3 className="font-semibold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">Microsoft Certified</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Engineers Who Landed the Job</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-border/50 bg-background/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />))}</div>
                    <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full azure-gradient flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                      <div><div className="font-medium text-sm">{t.name}</div><div className="text-xs text-muted-foreground">{t.role}</div></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl azure-gradient p-12 text-center text-white">
            <Cloud className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl font-bold mb-4">Start Your Azure DE Journey Today</h2>
            <p className="text-xl opacity-90 mb-8 max-w-xl mx-auto">Join thousands of engineers mastering Azure Data Engineering. Free forever.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/roadmap"><Button size="xl" className="bg-white text-[#0078d4] hover:bg-white/90 font-bold shadow-xl">Start Learning Now<ArrowRight className="w-5 h-5" /></Button></Link>
              <Link href="/interview"><Button size="xl" variant="glass" className="border-white/30 text-white hover:bg-white/15">Practice Interviews</Button></Link>
            </div>
            <p className="mt-6 text-sm opacity-75">No signup required · 300+ interview questions · 10 real-world projects</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
