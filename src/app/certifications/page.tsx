'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Award, Clock, CheckCircle2, ArrowRight, Star, BookOpen, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CERTS = [
  {
    code: 'dp-203',
    name: 'DP-203',
    fullName: 'Data Engineering on Microsoft Azure',
    level: 'Associate',
    duration: '6 weeks',
    color: '#0078d4',
    gradient: 'from-blue-500 to-cyan-500',
    price: '$165',
    topics: ['Azure Storage', 'Azure Data Factory', 'Azure Synapse', 'Azure Databricks', 'Azure Stream Analytics'],
    skills: ['Design and implement data storage (40-45%)', 'Design and develop data processing (25-30%)', 'Design and implement data security (10-15%)', 'Monitor and optimize data storage and processing (10-15%)'],
    recommended: true,
    description: 'The primary certification for Azure Data Engineers. Validates your ability to design and implement data solutions using Azure data services.'
  },
  {
    code: 'az-900',
    name: 'AZ-900',
    fullName: 'Azure Fundamentals',
    level: 'Fundamental',
    duration: '2 weeks',
    color: '#0078d4',
    gradient: 'from-blue-400 to-blue-600',
    price: '$165',
    topics: ['Cloud Concepts', 'Core Azure Services', 'Azure Pricing', 'Azure Governance', 'Azure Security'],
    skills: ['Cloud concepts (25-30%)', 'Core Azure services (15-20%)', 'Core solutions and management tools (10-15%)', 'Security, privacy, compliance, and trust (25-30%)', 'Azure pricing and SLAs (20-25%)'],
    recommended: false,
    description: 'The starting point for Azure learners. Validates foundational cloud knowledge. Complete this before DP-203.'
  },
  {
    code: 'dp-900',
    name: 'DP-900',
    fullName: 'Azure Data Fundamentals',
    level: 'Fundamental',
    duration: '2 weeks',
    color: '#008272',
    gradient: 'from-teal-500 to-emerald-500',
    price: '$165',
    topics: ['Core Data Concepts', 'Relational Data on Azure', 'Non-relational Data', 'Analytics Workloads'],
    skills: ['Core data concepts (25-30%)', 'Relational data on Azure (20-25%)', 'Non-relational data on Azure (15-20%)', 'Analytics workloads on Azure (25-30%)'],
    recommended: false,
    description: 'Validates understanding of core data concepts and how Azure data services are implemented. Great stepping stone to DP-203.'
  },
  {
    code: 'ai-900',
    name: 'AI-900',
    fullName: 'Azure AI Fundamentals',
    level: 'Fundamental',
    duration: '2 weeks',
    color: '#7719aa',
    gradient: 'from-purple-500 to-pink-500',
    price: '$165',
    topics: ['AI Workloads', 'Machine Learning', 'Computer Vision', 'NLP', 'Conversational AI'],
    skills: ['AI workloads and considerations (15-20%)', 'Machine learning on Azure (30-35%)', 'Computer vision workloads (15-20%)', 'NLP workloads (15-20%)', 'Conversational AI (15-20%)'],
    recommended: false,
    description: 'Validates AI and ML fundamentals on Azure. Useful for data engineers working with Azure Machine Learning and AI services.'
  }
];

const EXAM_TIPS = [
  'Use Microsoft Learn modules — they are free and directly aligned to exam objectives',
  'Practice with official sample questions and Microsoft practice tests',
  'Focus on the skill measurement areas by weight — higher weight = more questions',
  'Read the official exam study guide (free PDF from Microsoft)',
  'Do hands-on labs in the Azure free tier ($200 credit for new accounts)',
  'Take the exam within 2 weeks of finishing your study — knowledge decays',
  'Flag uncertain questions and return to them — you have plenty of time',
  'Book the exam date first — having a deadline forces you to study'
];

export default function CertificationsPage() {
  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">4 Certifications</Badge>
          <h1 className="text-5xl font-bold mb-4">
            Microsoft <span className="azure-gradient-text">Azure Certifications</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dedicated study plans, practice questions, exam tips, and mock tests for each Azure certification.
            Structured paths from fundamental to associate level.
          </p>
        </motion.div>

        {/* Recommended path */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#0078d4]" />Recommended Study Path
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {['AZ-900 (2 weeks)', 'DP-900 (2 weeks)', 'DP-203 (6 weeks)'].map((cert, i, arr) => (
                <div key={cert} className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-[#0078d4]/10 border border-[#0078d4]/20 text-sm font-medium text-[#0078d4]">
                    {cert}
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                </div>
              ))}
              <div className="ml-auto text-sm text-muted-foreground">Total: ~10 weeks</div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              AZ-900 → DP-900 builds foundational knowledge. DP-203 is the main data engineering certification.
              AI-900 is optional but valuable if working with ML pipelines.
            </p>
          </div>
        </motion.div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {CERTS.map((cert, i) => (
            <motion.div
              key={cert.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full card-hover border-border/50 overflow-hidden">
                {cert.recommended && (
                  <div className="bg-[#0078d4] text-white text-xs text-center py-1.5 font-medium">
                    ⭐ Primary DE Certification — Start Here
                  </div>
                )}
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cert.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0`}>
                      {cert.name}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{cert.fullName}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{cert.level}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{cert.duration} study
                        </span>
                        <span className="text-xs text-muted-foreground">{cert.price}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{cert.description}</p>

                  {/* Topics */}
                  <div className="mb-4">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Topics Covered</div>
                    <div className="flex flex-wrap gap-1">
                      {cert.topics.map(topic => (
                        <span key={topic} className="text-xs px-2 py-1 rounded-lg bg-secondary text-muted-foreground">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-5">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Skills Measured</div>
                    <div className="space-y-1.5">
                      {cert.skills.slice(0, 3).map(skill => (
                        <div key={skill} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href={`/certifications/${cert.code}`}>
                    <Button variant={cert.recommended ? 'gradient' : 'outline'} className="w-full group">
                      View Study Plan
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Exam Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold text-center mb-8">Universal Exam Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EXAM_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background/50">
                <div className="w-6 h-6 rounded-full bg-[#0078d4]/10 text-[#0078d4] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
