'use client';

import { use, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Award, BookOpen, Target, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProgressStore } from '@/store/progress';
import { cn } from '@/lib/utils';

const CERT_DATA: Record<string, {
  code: string; name: string; fullName: string; level: string; price: string; duration: string;
  color: string; gradient: string; passScore: number; questionCount: number;
  description: string;
  objectives: string[];
  studyPlan: { week: number; title: string; topics: string[]; resources: string[] }[];
  practiceQuestions: { q: string; options: string[]; answer: number; explanation: string }[];
  examTips: string[];
  skillAreas: { area: string; weight: string; topics: string[] }[];
}> = {
  'dp-203': {
    code: 'dp-203', name: 'DP-203', fullName: 'Data Engineering on Microsoft Azure',
    level: 'Associate', price: '$165', duration: '6 weeks', passScore: 700, questionCount: 40,
    color: '#0078d4', gradient: 'from-blue-500 to-cyan-500',
    description: 'The primary Azure Data Engineer certification. Validates your ability to design and implement data solutions using the full Azure data ecosystem.',
    objectives: [
      'Design and implement data storage solutions using Azure Blob Storage, ADLS Gen2, and Azure SQL',
      'Implement data processing pipelines using ADF, Synapse Pipelines, and Databricks',
      'Apply security controls: encryption, RBAC, managed identities, Private Endpoints',
      'Optimize data storage and processing workloads for performance and cost',
      'Monitor Azure data services using Azure Monitor, Log Analytics, and alerts',
      'Design streaming architectures using Event Hubs and Stream Analytics',
    ],
    studyPlan: [
      { week: 1, title: 'Storage Foundations', topics: ['Azure Storage Accounts', 'ADLS Gen2 + HNS', 'Azure SQL Database', 'Azure Cosmos DB'], resources: ['MS Learn: Store data in Azure', 'AZ-204 Storage Module', 'Practice: Create ADLS + upload files'] },
      { week: 2, title: 'Data Integration - ADF', topics: ['Linked Services & Datasets', 'Copy Activity deep dive', 'Data Flows (Mapping)', 'Triggers & Monitoring'], resources: ['MS Learn: ADF learning path', 'ADF Official Docs', 'Lab: Copy CSV → Azure SQL'] },
      { week: 3, title: 'Azure Synapse Analytics', topics: ['Dedicated SQL Pool', 'Serverless SQL Pool', 'Synapse Spark', 'Distribution strategies'], resources: ['MS Learn: Synapse Learning Path', 'Synapse SQL documentation', 'Lab: Star schema in Synapse'] },
      { week: 4, title: 'Azure Databricks & Spark', topics: ['Delta Lake fundamentals', 'PySpark API', 'Spark optimization', 'Databricks workflows'], resources: ['Databricks Academy (free)', 'Delta Lake docs', 'Lab: Build Medallion architecture'] },
      { week: 5, title: 'Streaming & Security', topics: ['Event Hubs partitions', 'Stream Analytics jobs', 'Private Endpoints', 'RBAC & Managed Identities'], resources: ['MS Learn: Event Hubs', 'MS Learn: Security module', 'Lab: IoT streaming pipeline'] },
      { week: 6, title: 'Mock Tests & Review', topics: ['Practice exams (3 full sets)', 'Weak area review', 'Flashcard revision', 'Exam day strategy'], resources: ['Microsoft official practice test', 'MeasureUp DP-203', 'Udemy practice tests by Scott Duffy'] },
    ],
    practiceQuestions: [
      { q: 'You need to store 50TB of semi-structured JSON data and query it using serverless SQL. Which Azure service is most appropriate?', options: ['Azure SQL Database', 'Azure Synapse Serverless SQL Pool on ADLS Gen2', 'Azure Cosmos DB', 'Azure Table Storage'], answer: 1, explanation: 'Synapse Serverless SQL Pool can query JSON/Parquet/CSV files stored in ADLS Gen2 without loading them into a database — perfect for ad-hoc analytics on large semi-structured data.' },
      { q: 'A Spark job is running slowly and the Spark UI shows one task taking 10× longer than others. What is the most likely cause?', options: ['Insufficient executor memory', 'Data skew on the join key', 'Too many shuffle partitions', 'Missing broadcast hint'], answer: 1, explanation: 'Data skew occurs when one partition has significantly more data than others (e.g., a popular customer ID). The skewed partition takes much longer. Solutions: salt the key, use AQE skew handling, or repartition.' },
      { q: 'You need ADF to connect to an on-premises SQL Server without exposing it to the internet. What should you use?', options: ['Public endpoint with IP firewall', 'Self-hosted Integration Runtime', 'Azure Integration Runtime', 'VPN Gateway only'], answer: 1, explanation: 'Self-hosted IR (SHIR) is installed on an on-premises machine and establishes an outbound connection to ADF. It allows ADF to reach on-premises data stores without inbound firewall rules.' },
      { q: 'Which Delta Lake command removes old data files while keeping the latest version accessible?', options: ['OPTIMIZE', 'VACUUM RETAIN 168 HOURS', 'COMPACT', 'RESTORE TABLE'], answer: 1, explanation: 'VACUUM removes data files no longer referenced by the Delta table log. The RETAIN clause specifies the minimum file age to keep (default 7 days = 168 hours). This frees storage without breaking time travel within the retention window.' },
      { q: 'For a 500GB fact table in Synapse Dedicated SQL Pool, which distribution strategy is optimal when the table is frequently joined on customer_id?', options: ['ROUND_ROBIN', 'REPLICATE', 'HASH (customer_id)', 'HEAP'], answer: 2, explanation: 'HASH distribution on the join key collocates matching rows in the same distribution, eliminating data movement during joins. ROUND_ROBIN has random distribution causing data movement. REPLICATE is only for small tables (<2GB).' },
    ],
    examTips: [
      'Focus heavily on the 40-45% weight area: Design and implement data storage (ADLS, SQL, Cosmos)',
      'Know the difference between Copy Activity vs Data Flow in ADF — Copy = structured → structured; Data Flow = transformation',
      'Understand distribution types in Synapse: HASH for large fact tables, REPLICATE for small dims, ROUND_ROBIN for staging',
      'Delta Lake MERGE, OPTIMIZE, VACUUM, and time travel are almost always tested',
      'Know managed identity vs service principal — managed identity is preferred (no secrets)',
      'Event Hubs partition count affects throughput scaling — cannot be decreased after creation',
      'Private Endpoint vs Service Endpoint: PE creates a private IP in your VNet; SE extends VNet route to public service',
      'COPY INTO (Synapse) is faster and cheaper than PolyBase for loading from ADLS Gen2',
    ],
    skillAreas: [
      { area: 'Design and implement data storage', weight: '40-45%', topics: ['ADLS Gen2', 'Azure Blob Storage', 'Azure SQL', 'Cosmos DB', 'Delta Lake', 'File formats (Parquet, Avro, ORC)'] },
      { area: 'Design and develop data processing', weight: '25-30%', topics: ['ADF pipelines', 'Synapse Analytics', 'Databricks', 'Spark SQL', 'Stream Analytics'] },
      { area: 'Design and implement data security', weight: '10-15%', topics: ['RBAC', 'Managed Identity', 'Private Endpoints', 'Encryption at rest', 'Data masking'] },
      { area: 'Monitor and optimize data storage and processing', weight: '10-15%', topics: ['Azure Monitor', 'Log Analytics', 'Spark UI', 'Query plans', 'Cost optimization'] },
    ],
  },
  'az-900': {
    code: 'az-900', name: 'AZ-900', fullName: 'Azure Fundamentals',
    level: 'Fundamental', price: '$165', duration: '2 weeks', passScore: 700, questionCount: 40,
    color: '#0078d4', gradient: 'from-blue-400 to-blue-600',
    description: 'The entry point to Azure certifications. Validates foundational cloud computing and Azure knowledge. No hands-on experience required.',
    objectives: [
      'Describe cloud computing concepts: IaaS, PaaS, SaaS, public/private/hybrid cloud',
      'Describe core Azure services: compute, storage, networking, databases',
      'Describe core Azure solutions and management tools',
      'Describe general security and network security features in Azure',
      'Describe identity, governance, privacy, and compliance features',
      'Describe Azure cost management and service level agreements',
    ],
    studyPlan: [
      { week: 1, title: 'Cloud Concepts & Core Services', topics: ['Cloud computing models', 'IaaS/PaaS/SaaS', 'Core Azure compute (VMs, App Service)', 'Storage & networking basics'], resources: ['MS Learn: AZ-900 Learning Path (free)', 'John Savill AZ-900 Study Cram (YouTube)', 'Azure Fundamentals PDF'] },
      { week: 2, title: 'Security, Pricing & Mock Tests', topics: ['Azure security tools', 'Azure pricing calculator', 'TCO calculator', 'Practice exams'], resources: ['Azure Free Account (hands-on)', 'Microsoft Practice Assessment (free)', 'WhizLabs AZ-900 Practice Tests'] },
    ],
    practiceQuestions: [
      { q: 'Which cloud deployment model provides dedicated hardware to a single organization?', options: ['Public cloud', 'Hybrid cloud', 'Private cloud', 'Community cloud'], answer: 2, explanation: 'A private cloud is operated solely for one organization. The infrastructure may be on-premises or hosted by a third party, but resources are not shared with other organizations.' },
      { q: 'Which Azure service provides a managed Kubernetes cluster?', options: ['Azure Container Instances', 'Azure Kubernetes Service (AKS)', 'Azure App Service', 'Azure Functions'], answer: 1, explanation: 'AKS is a managed Kubernetes service that handles control plane management, scaling, and upgrades automatically. ACI is for single containers without orchestration.' },
      { q: 'What is the Azure SLA for virtual machines using Availability Zones?', options: ['99.9%', '99.95%', '99.99%', '100%'], answer: 2, explanation: 'VMs deployed across two or more Availability Zones in the same region have a 99.99% SLA. Single VMs with Premium SSD have a 99.9% SLA.' },
    ],
    examTips: [
      'AZ-900 is beginner-friendly — 2 weeks of study is enough for most people',
      'The Microsoft Learn AZ-900 path is free and directly aligned to the exam',
      'Focus on understanding the difference between IaaS, PaaS, and SaaS with real examples',
      'Know the Azure pricing models: pay-as-you-go, reserved, spot instances',
      'Understand the shared responsibility model — what Microsoft manages vs. you manage',
      'The free Microsoft Practice Assessment is the best mock test available',
    ],
    skillAreas: [
      { area: 'Cloud concepts', weight: '25-30%', topics: ['Cloud computing', 'Benefits of cloud', 'Cloud service types (IaaS/PaaS/SaaS)'] },
      { area: 'Azure architecture and services', weight: '35-40%', topics: ['Regions and availability zones', 'Core compute, storage, networking, database services'] },
      { area: 'Azure management and governance', weight: '30-35%', topics: ['Cost management', 'Azure Policy', 'Resource locks', 'Monitoring', 'Compliance tools'] },
    ],
  },
  'dp-900': {
    code: 'dp-900', name: 'DP-900', fullName: 'Azure Data Fundamentals',
    level: 'Fundamental', price: '$165', duration: '2 weeks', passScore: 700, questionCount: 40,
    color: '#008272', gradient: 'from-teal-500 to-emerald-500',
    description: 'Validates foundational knowledge of data concepts and how they are implemented using Azure data services. Excellent stepping stone to DP-203.',
    objectives: [
      'Identify core data concepts: structured, semi-structured, unstructured',
      'Describe relational data workloads and services (Azure SQL family)',
      'Describe non-relational data workloads and services (Cosmos DB, Blob Storage)',
      'Describe analytics workloads using Synapse, Databricks, and Power BI',
      'Identify batch vs streaming data processing patterns',
    ],
    studyPlan: [
      { week: 1, title: 'Core Data Concepts', topics: ['Structured vs unstructured data', 'Relational databases', 'Azure SQL family', 'Non-relational databases'], resources: ['MS Learn: DP-900 Learning Path', 'Azure Data Fundamentals PDF Study Guide', 'Azure portal hands-on: Create a SQL DB'] },
      { week: 2, title: 'Analytics & Mock Tests', topics: ['Data warehousing concepts', 'Azure Synapse overview', 'Power BI basics', 'Batch vs streaming'], resources: ['MS Learn: Analytics on Azure', 'Microsoft Practice Assessment', 'ExamTopics DP-900 practice'] },
    ],
    practiceQuestions: [
      { q: 'Which Azure service is a fully managed NoSQL database optimized for low latency at global scale?', options: ['Azure SQL Database', 'Azure Table Storage', 'Azure Cosmos DB', 'Azure Database for PostgreSQL'], answer: 2, explanation: 'Azure Cosmos DB is Microsoft\'s globally distributed, multi-model NoSQL database. It guarantees single-digit millisecond latency and supports multiple APIs (SQL, MongoDB, Cassandra).' },
      { q: 'What is the primary benefit of column-store indexes in a data warehouse?', options: ['Faster row-level inserts', 'Better support for OLTP transactions', 'Higher compression and faster analytical query performance', 'Easier index maintenance'], answer: 2, explanation: 'Columnstore indexes store data column by column (not row by row), achieving 10:1 compression ratios and enabling batch mode processing — dramatically faster for analytical aggregations over millions of rows.' },
      { q: 'Which Azure service provides real-time analytics on streaming data?', options: ['Azure Data Factory', 'Azure Stream Analytics', 'Azure SQL Database', 'Azure Databricks Jobs'], answer: 1, explanation: 'Azure Stream Analytics is a fully managed real-time analytics service for streaming data. It uses a SQL-like query language and can ingest from Event Hubs, IoT Hub, or Blob Storage.' },
    ],
    examTips: [
      'DP-900 is conceptual — you do not need to know how to write Spark code or T-SQL',
      'Understand the distinction between OLTP (operational) and OLAP (analytical) workloads',
      'Know when to use each Azure data service: SQL for relational, Cosmos for NoSQL, Synapse for analytics',
      'Batch vs streaming is frequently tested — know the difference and which Azure services apply',
      'The Microsoft Learn path for DP-900 is free and sufficient as the only study material',
    ],
    skillAreas: [
      { area: 'Core data concepts', weight: '25-30%', topics: ['Data formats', 'Databases', 'Transactional workloads', 'Analytical workloads'] },
      { area: 'Relational data on Azure', weight: '20-25%', topics: ['Azure SQL Database', 'Azure SQL Managed Instance', 'Azure Database for PostgreSQL/MySQL'] },
      { area: 'Non-relational data on Azure', weight: '15-20%', topics: ['Azure Cosmos DB', 'Azure Blob Storage', 'Azure Table Storage', 'Azure Files'] },
      { area: 'Analytics workloads on Azure', weight: '25-30%', topics: ['Synapse Analytics', 'Databricks', 'HDInsight', 'Power BI'] },
    ],
  },
  'ai-900': {
    code: 'ai-900', name: 'AI-900', fullName: 'Azure AI Fundamentals',
    level: 'Fundamental', price: '$165', duration: '2 weeks', passScore: 700, questionCount: 40,
    color: '#7719aa', gradient: 'from-purple-500 to-pink-500',
    description: 'Validates foundational understanding of AI and ML concepts and how they are implemented using Azure AI services. Relevant for data engineers building ML pipelines.',
    objectives: [
      'Identify AI workloads and considerations: bias, fairness, responsible AI',
      'Describe machine learning concepts: supervised, unsupervised, reinforcement learning',
      'Describe Azure Machine Learning and AutoML features',
      'Describe computer vision workloads and Azure Vision services',
      'Describe NLP and conversational AI: Azure Language, Bot Service, Speech',
    ],
    studyPlan: [
      { week: 1, title: 'AI Concepts & ML on Azure', topics: ['Responsible AI principles', 'ML model types', 'Azure Machine Learning studio', 'AutoML and Designer'], resources: ['MS Learn: AI-900 Learning Path (free)', 'AI-900 Study Guide PDF', 'Azure ML studio: Create a free workspace'] },
      { week: 2, title: 'Cognitive Services & Mock Tests', topics: ['Computer Vision API', 'Azure Language Service', 'Azure Bot Service', 'Practice exams'], resources: ['Azure Cognitive Services docs', 'Microsoft Practice Assessment', 'Adam Marczak AI-900 (YouTube)'] },
    ],
    practiceQuestions: [
      { q: 'A company wants to automatically categorize customer support emails by topic. Which Azure AI feature is most appropriate?', options: ['Computer Vision', 'Text Classification (Azure Language Service)', 'Azure Bot Service', 'Speech to Text'], answer: 1, explanation: 'Text Classification is a feature of Azure Language Service that categorizes text into predefined labels. For customer email categorization, you would train a custom text classification model on labeled email data.' },
      { q: 'Which responsible AI principle addresses ensuring AI systems are understandable and their decisions can be explained?', options: ['Fairness', 'Reliability', 'Transparency', 'Privacy and security'], answer: 2, explanation: 'Transparency (also called Explainability) means AI systems should be understandable — stakeholders should be able to explain how the model makes decisions. This is critical for regulatory compliance and trust.' },
      { q: 'What is the difference between supervised and unsupervised machine learning?', options: ['Supervised uses more data; unsupervised uses less', 'Supervised uses labeled training data; unsupervised finds patterns in unlabeled data', 'Supervised requires GPUs; unsupervised runs on CPUs', 'There is no meaningful difference'], answer: 1, explanation: 'Supervised learning trains on labeled examples (input + known output). Unsupervised learning finds hidden patterns in data without labels (clustering, anomaly detection). The label availability is the key distinction.' },
    ],
    examTips: [
      'AI-900 is conceptual — understand concepts and when to apply Azure AI services',
      'The Microsoft Responsible AI principles (Fairness, Reliability, Privacy, Inclusiveness, Transparency, Accountability) are almost always on the exam',
      'Know the difference between supervised, unsupervised, and reinforcement learning',
      'Understand which Azure service maps to which AI task: Vision → image classification, Language → NLP, Speech → audio',
      'Azure Machine Learning is primarily for custom model training; Azure Cognitive Services for pre-built AI APIs',
    ],
    skillAreas: [
      { area: 'AI workloads and considerations', weight: '15-20%', topics: ['Common AI workloads', 'Responsible AI principles', 'Bias and fairness'] },
      { area: 'Machine learning on Azure', weight: '30-35%', topics: ['Azure Machine Learning', 'AutoML', 'Designer', 'Training vs inference'] },
      { area: 'Computer vision on Azure', weight: '15-20%', topics: ['Azure Computer Vision', 'Custom Vision', 'Face API', 'Form Recognizer'] },
      { area: 'NLP workloads on Azure', weight: '15-20%', topics: ['Azure Language Service', 'Text analytics', 'Translation', 'Speech service'] },
      { area: 'Conversational AI on Azure', weight: '15-20%', topics: ['Azure Bot Service', 'QnA Maker', 'Language Understanding (LUIS)'] },
    ],
  },
};

function QuizSection({ questions }: { questions: typeof CERT_DATA['dp-203']['practiceQuestions'] }) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-6">
      {questions.map((q, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-5">
            <p className="font-medium text-sm mb-4">Q{i + 1}. {q.q}</p>
            <div className="space-y-2 mb-4">
              {q.options.map((opt, j) => (
                <button
                  key={j}
                  onClick={() => setSelected(prev => ({ ...prev, [i]: j }))}
                  className={cn(
                    'w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all',
                    selected[i] === undefined ? 'border-border hover:border-[#0078d4]/40 hover:bg-[#0078d4]/3' : '',
                    selected[i] === j && !revealed[i] ? 'border-[#0078d4] bg-[#0078d4]/10 text-[#0078d4]' : '',
                    revealed[i] && j === q.answer ? 'border-green-500 bg-green-500/10 text-green-400' : '',
                    revealed[i] && selected[i] === j && j !== q.answer ? 'border-red-500 bg-red-500/10 text-red-400' : '',
                    revealed[i] && j !== q.answer && selected[i] !== j ? 'opacity-50' : '',
                  )}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + j)}.</span>{opt}
                </button>
              ))}
            </div>
            {selected[i] !== undefined && !revealed[i] && (
              <Button variant="outline" size="sm" onClick={() => setRevealed(prev => ({ ...prev, [i]: true }))}>
                Reveal Answer
              </Button>
            )}
            {revealed[i] && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-lg bg-secondary/40 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Explanation: </span>{q.explanation}
              </motion.div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CertDetailPage({ params }: { params: Promise<{ cert: string }> }) {
  const { cert: certCode } = use(params);
  const data = CERT_DATA[certCode];
  const { completedCertifications, markCertificationComplete } = useProgressStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'studyplan' | 'practice' | 'tips'>('overview');

  if (!data) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Certification not found</h1>
          <Link href="/certifications"><Button variant="outline">← Back to Certifications</Button></Link>
        </div>
      </div>
    );
  }

  const isComplete = completedCertifications.includes(data.code);

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-5xl mx-auto py-10">
        {/* Back */}
        <Link href="/certifications" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />Back to Certifications
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`glass rounded-2xl p-8 mb-8 bg-gradient-to-br ${data.gradient} bg-opacity-5`}>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${data.gradient} flex items-center justify-center text-white font-bold text-xl shadow-xl shrink-0`}>
                {data.name}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-[#0078d4]/30 text-[#0078d4]">{data.level}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{data.duration} study</span>
                  <span className="text-sm text-muted-foreground">{data.price}</span>
                  <span className="text-sm text-muted-foreground">Pass: {data.passScore}/1000</span>
                  <span className="text-sm text-muted-foreground">{data.questionCount} questions</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">{data.fullName}</h1>
                <p className="text-muted-foreground">{data.description}</p>
              </div>
              <Button
                variant={isComplete ? 'outline' : 'gradient'}
                onClick={() => markCertificationComplete(data.code)}
                className="shrink-0"
              >
                {isComplete ? <><CheckCircle2 className="w-4 h-4 text-green-400" /> Earned</> : 'Mark as Earned'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {(['overview', 'studyplan', 'practice', 'tips'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-medium border capitalize transition-all',
                activeTab === tab ? 'bg-[#0078d4] text-white border-[#0078d4]' : 'border-border text-muted-foreground hover:border-[#0078d4]/30'
              )}
            >
              {tab === 'studyplan' ? 'Study Plan' : tab === 'practice' ? 'Practice Questions' : tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Skill areas */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-[#0078d4]" />Skills Measured (Exam Weight)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {data.skillAreas.map((area, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{area.area}</span>
                      <Badge variant="outline" className="text-xs">{area.weight}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {area.topics.map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning objectives */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#0078d4]" />What You'll Learn</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      {obj}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Study Plan */}
        {activeTab === 'studyplan' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {data.studyPlan.map((week, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0" style={{ background: data.color }}>
                      W{week.week}
                    </div>
                    <h3 className="font-bold">{week.title}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1.5">Topics to Cover</div>
                      {week.topics.map(t => (
                        <div key={t} className="flex items-center gap-2 text-sm mb-1 text-muted-foreground">
                          <ChevronRight className="w-3 h-3 text-[#0078d4]" />{t}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1.5">Resources</div>
                      {week.resources.map(r => (
                        <div key={r} className="flex items-center gap-2 text-sm mb-1 text-muted-foreground">
                          <Star className="w-3 h-3 text-yellow-400" />{r}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Practice Questions */}
        {activeTab === 'practice' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 p-3 rounded-lg bg-[#0078d4]/5 border border-[#0078d4]/20 text-sm text-muted-foreground">
              Select your answer, then click "Reveal Answer" to see the explanation. These questions reflect the style and difficulty of the real exam.
            </div>
            <QuizSection questions={data.practiceQuestions} />
          </motion.div>
        )}

        {/* Tips */}
        {activeTab === 'tips' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 gap-3">
              {data.examTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-background/50">
                  <div className="w-7 h-7 rounded-full bg-[#0078d4]/10 text-[#0078d4] text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
