'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { use } from 'react';
import {
  BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle2, Bookmark, BookmarkCheck,
  Copy, Check, ChevronDown, ChevronUp, Brain, Code2, Lightbulb, AlertTriangle,
  Target, ExternalLink, Award, Play, FileText, HelpCircle, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/store/progress';
import { PHASES } from '@/data/roadmap';
import { getDifficultyBg, cn } from '@/lib/utils';
import { Topic } from '@/types';
import { TOPIC_CONTENT } from '@/data/topic-content';

const DEFAULT_CONTENT = {
  simpleExplanation: 'This topic covers essential Azure Data Engineering concepts that are critical for building production-grade data platforms.',
  deepExplanation: 'This is an advanced topic that requires understanding of both the theoretical concepts and practical implementation details. In real-world Azure data engineering, this knowledge is applied daily when designing, building, and maintaining data pipelines.',
  keyPoints: [
    'Understand the core concepts and how they fit into the Azure ecosystem',
    'Know when to use this service/pattern vs alternatives',
    'Be able to explain the architecture and trade-offs in interviews',
    'Have hands-on experience configuring and troubleshooting',
    'Know the security and networking considerations',
  ],
  commonMistakes: [
    'Not reading the documentation carefully before implementation',
    'Ignoring security best practices from the start',
    'Not considering performance implications at scale',
    'Skipping proper error handling and monitoring',
  ],
  interviewTips: [
    'Be able to draw the architecture on a whiteboard',
    'Know the key configuration options and trade-offs',
    'Have a real example from a project to reference',
    'Understand how this integrates with other Azure services',
  ],
  bestPractices: [
    'Follow Azure Well-Architected Framework principles',
    'Use managed identities instead of service principals where possible',
    'Implement proper monitoring and alerting from day one',
    'Use infrastructure as code (Bicep/Terraform) for all resources',
  ],
  codeExamples: [
    {
      title: 'Azure CLI - Common Commands',
      language: 'bash',
      code: `# Login to Azure
az login

# Set subscription
az account set --subscription "my-subscription-id"

# List resource groups
az group list --output table

# Create a resource group
az group create --name "rg-data-platform" --location "eastus2"

# Deploy a Bicep template
az deployment group create \\
  --resource-group "rg-data-platform" \\
  --template-file main.bicep \\
  --parameters environment=dev`
    }
  ],
  resources: [
    { title: 'Microsoft Learn - Azure Data Fundamentals', url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/', type: 'course', free: true },
    { title: 'Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/', type: 'docs', free: true },
    { title: 'Microsoft Tech Community - Azure DE', url: 'https://techcommunity.microsoft.com/t5/azure-data-engineering/bg-p/AzureDataEngineering', type: 'blog', free: true },
  ],
  quiz: [
    {
      question: 'Which Azure service is the primary managed ETL/ELT tool for orchestrating data movement?',
      options: ['Azure Databricks', 'Azure Data Factory', 'Azure Synapse Pipelines', 'Azure Functions'],
      answer: 1,
      explanation: 'Azure Data Factory is Azure\'s primary managed ETL/ELT service for data integration at scale. While Synapse has pipelines too (same engine), ADF is the dedicated service for data movement and transformation.'
    }
  ]
};

function CodeBlock({ code, language, title, description }: { code: string; language: string; title: string; description?: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <div>
          <span className="text-sm font-medium text-white">{title}</span>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-[#0d1117] px-2 py-0.5 rounded">{language}</span>
          <button onClick={copyCode} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded hover:bg-white/10">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function QuizSection({ questions }: { questions: typeof DEFAULT_CONTENT.quiz }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-6">
      {questions.map((q, i) => (
        <div key={i} className="rounded-xl border border-border p-5">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0078d4] text-white text-xs flex items-center justify-center">{i + 1}</span>
            {q.question}
          </h4>
          <div className="space-y-2 mb-4">
            {q.options.map((option, j) => (
              <button
                key={j}
                onClick={() => setAnswers({ ...answers, [i]: j })}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all',
                  answers[i] === j
                    ? revealed[i]
                      ? j === q.answer ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'
                      : 'bg-[#0078d4]/10 border-[#0078d4] text-[#0078d4]'
                    : revealed[i] && j === q.answer
                    ? 'bg-green-500/10 border-green-500 text-green-400'
                    : 'border-border hover:border-[#0078d4]/30 hover:bg-[#0078d4]/5'
                )}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + j)}.</span> {option}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {answers[i] !== undefined && !revealed[i] && (
              <Button size="sm" onClick={() => setRevealed({ ...revealed, [i]: true })}>Check Answer</Button>
            )}
            {revealed[i] && (
              <div className="flex-1 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = use(params);
  const [activeSection, setActiveSection] = useState('overview');
  const { isTopicComplete, markTopicComplete, markTopicIncomplete, isBookmarked, addBookmark, removeBookmark } = useProgressStore();

  // Find the topic across all phases
  let topicData: Topic | null = null;
  let phaseData = null;
  let topicIndex = 0;
  let nextTopic: Topic | null = null;
  let prevTopic: Topic | null = null;

  for (const phase of PHASES) {
    const idx = phase.topics.findIndex(t => t.slug === topic);
    if (idx !== -1) {
      topicData = phase.topics[idx];
      phaseData = phase;
      topicIndex = idx;
      prevTopic = idx > 0 ? phase.topics[idx - 1] : null;
      nextTopic = idx < phase.topics.length - 1 ? phase.topics[idx + 1] : null;
      break;
    }
  }

  const content = TOPIC_CONTENT[topic] || DEFAULT_CONTENT;
  const isComplete = topicData ? isTopicComplete(topicData.id) : false;
  const bookmarked = topicData ? isBookmarked(topicData.id) : false;

  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'deep-dive', label: 'Deep Dive', icon: Brain },
    { id: 'code', label: 'Code Examples', icon: Code2 },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'resources', label: 'Resources', icon: ExternalLink },
  ];

  if (!topicData) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
          <p className="text-muted-foreground mb-6">The topic "{topic}" doesn't exist in our curriculum.</p>
          <Link href="/roadmap"><Button>Browse All Topics</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/roadmap" className="hover:text-foreground transition-colors">Roadmap</Link>
          <ChevronDown className="w-3 h-3 -rotate-90" />
          <span className="text-foreground">{topicData.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Topic info */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={topicData.difficulty === 'Beginner' ? 'success' : topicData.difficulty === 'Intermediate' ? 'warning' : 'danger'} className="border text-xs">
                      {topicData.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{topicData.estimatedTime}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {topicData.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => isComplete ? markTopicIncomplete(topicData!.id) : markTopicComplete(topicData!.id)}
                      variant={isComplete ? 'secondary' : 'default'}
                      className="w-full"
                    >
                      {isComplete ? (
                        <><CheckCircle2 className="w-4 h-4 text-green-500" />Completed</>
                      ) : (
                        <><Target className="w-4 h-4" />Mark Complete</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => bookmarked ? removeBookmark(topicData!.id) : addBookmark(topicData!.id)}
                    >
                      {bookmarked ? <><BookmarkCheck className="w-4 h-4" />Bookmarked</> : <><Bookmark className="w-4 h-4" />Bookmark</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation sections */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    {sections.map(section => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left',
                          activeSection === section.id
                            ? 'bg-[#0078d4]/10 text-[#0078d4]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        )}
                      >
                        <section.icon className="w-4 h-4" />
                        {section.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Phase context */}
              {phaseData && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">Part of</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center" style={{ background: phaseData.color }}>
                        {phaseData.number}
                      </div>
                      <span className="text-sm font-medium">{phaseData.title}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Topic {topicIndex + 1} of {phaseData.topics.length}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl font-bold mb-3">{topicData.title}</h1>
              <p className="text-lg text-muted-foreground mb-8">{topicData.description}</p>

              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div className="space-y-8">
                  {/* Simple Explanation */}
                  <Card className="border-[#0078d4]/20 bg-[#0078d4]/5">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-[#0078d4]" />
                        <h2 className="font-bold text-lg">Simple Explanation</h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{content.simpleExplanation}</p>
                    </CardContent>
                  </Card>

                  {/* Learning Objectives */}
                  {topicData.objectives.length > 0 && (
                    <div>
                      <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#0078d4]" />Learning Objectives
                      </h2>
                      <div className="space-y-2">
                        {topicData.objectives.map((obj, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm">{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Points */}
                  <div>
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />Key Points
                    </h2>
                    <div className="space-y-2">
                      {content.keyPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-[#0078d4]/30 transition-colors">
                          <div className="w-5 h-5 rounded-full bg-[#0078d4]/10 text-[#0078d4] text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common Mistakes */}
                  <div>
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />Common Mistakes
                    </h2>
                    <div className="space-y-2">
                      {content.commonMistakes.map((mistake, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <span className="text-sm">{mistake}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interview Tips */}
                  <div>
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-purple-500" />Interview Tips
                    </h2>
                    <div className="space-y-2">
                      {content.interviewTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                          <Brain className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div>
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-500" />Best Practices
                    </h2>
                    <div className="space-y-2">
                      {content.bestPractices.map((bp, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                          <span className="text-sm">{bp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Deep Dive Section */}
              {activeSection === 'deep-dive' && (
                <div className="prose dark:prose-invert max-w-none">
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <h2 className="font-bold text-xl mb-4">Deep Technical Explanation</h2>
                      <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                        {content.deepExplanation}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Code Examples Section */}
              {activeSection === 'code' && (
                <div className="space-y-4">
                  <h2 className="font-bold text-xl mb-4">Code Examples</h2>
                  {content.codeExamples.map((example, i) => (
                    <CodeBlock key={i} {...example} />
                  ))}
                </div>
              )}

              {/* Quiz Section */}
              {activeSection === 'quiz' && (
                <div>
                  <h2 className="font-bold text-xl mb-6">Knowledge Check</h2>
                  <QuizSection questions={content.quiz} />
                </div>
              )}

              {/* Resources Section */}
              {activeSection === 'resources' && (
                <div>
                  <h2 className="font-bold text-xl mb-6">Learning Resources</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {content.resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-4 rounded-xl border border-border hover:border-[#0078d4]/50 bg-background/50 hover:bg-[#0078d4]/5 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-sm mb-1 group-hover:text-[#0078d4] transition-colors">{resource.title}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant={resource.free ? 'success' : 'warning'} className="text-xs border">
                                {resource.free ? 'Free' : 'Paid'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[#0078d4] transition-colors shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
                {prevTopic ? (
                  <Link href={`/learn/${prevTopic.slug}`}>
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      {prevTopic.title}
                    </Button>
                  </Link>
                ) : <div />}

                {nextTopic && (
                  <Link href={`/learn/${nextTopic.slug}`}>
                    <Button variant="gradient" className="gap-2">
                      {nextTopic.title}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
