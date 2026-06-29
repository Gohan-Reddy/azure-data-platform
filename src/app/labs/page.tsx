'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Clock, Target, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LABS = [
  {
    id: 'lab-1',
    title: 'Build Your First ADF Pipeline',
    topic: 'Azure Data Factory',
    difficulty: 'Beginner',
    duration: '2 hours',
    description: 'Create an end-to-end ADF pipeline that copies data from Azure Blob Storage to Azure SQL Database. Configure linked services, datasets, and triggers.',
    objectives: ['Create a Storage Account and upload sample CSV', 'Configure ADF with Managed Identity', 'Build a Copy Activity pipeline', 'Schedule with a daily trigger', 'Monitor pipeline runs in ADF Monitor'],
    technologies: ['Azure Data Factory', 'Azure Blob Storage', 'Azure SQL Database', 'Azure Portal'],
    free: true,
  },
  {
    id: 'lab-2',
    title: 'ADLS Gen2 with Hierarchical Namespace',
    topic: 'ADLS Gen2',
    difficulty: 'Beginner',
    duration: '1 hour',
    description: 'Set up an ADLS Gen2 account with hierarchical namespace, configure RBAC, create bronze/silver/gold containers, and upload sample data.',
    objectives: ['Create ADLS Gen2 storage account', 'Configure hierarchical namespace', 'Set up container structure (bronze/silver/gold)', 'Assign RBAC roles to a service principal', 'Upload and read files with Azure CLI'],
    technologies: ['ADLS Gen2', 'Azure CLI', 'Azure RBAC'],
    free: true,
  },
  {
    id: 'lab-3',
    title: 'Delta Lake ACID Transactions',
    topic: 'Delta Lake',
    difficulty: 'Intermediate',
    duration: '3 hours',
    description: 'Experience ACID transactions on ADLS Gen2 using Delta Lake in Databricks. Implement MERGE for upserts, explore time travel, and run OPTIMIZE.',
    objectives: ['Create a Delta table from a DataFrame', 'Perform MERGE (upsert) operations', 'Use time travel to query historical versions', 'Run OPTIMIZE with Z-ORDER', 'Enable Change Data Feed and query changes'],
    technologies: ['Azure Databricks', 'Delta Lake', 'PySpark', 'ADLS Gen2'],
    free: true,
  },
  {
    id: 'lab-4',
    title: 'Spark SQL & Window Functions',
    topic: 'Apache Spark',
    difficulty: 'Intermediate',
    duration: '2 hours',
    description: 'Work with large datasets in Databricks. Write complex Spark SQL queries, use window functions, and analyze performance with the Spark UI.',
    objectives: ['Load a 1M+ row dataset into Databricks', 'Write GROUP BY aggregation queries', 'Implement ROW_NUMBER, LAG, LEAD window functions', 'Read a Spark execution plan', 'Identify and fix a data skew problem'],
    technologies: ['Azure Databricks', 'Spark SQL', 'PySpark'],
    free: true,
  },
  {
    id: 'lab-5',
    title: 'Real-Time Streaming with Event Hubs',
    topic: 'Streaming',
    difficulty: 'Advanced',
    duration: '4 hours',
    description: 'Send simulated IoT data to Event Hubs and process it with Spark Structured Streaming in Databricks. Write aggregated output to Delta Lake.',
    objectives: ['Create an Event Hubs namespace with 8 partitions', 'Write a Python IoT data simulator', 'Connect Databricks to Event Hubs', 'Apply watermarks for late data handling', 'Write streaming aggregations to Delta Lake'],
    technologies: ['Azure Event Hubs', 'Azure Databricks', 'Spark Structured Streaming', 'Delta Lake', 'Python'],
    free: true,
  },
  {
    id: 'lab-6',
    title: 'Synapse Dedicated SQL Pool',
    topic: 'Azure Synapse',
    difficulty: 'Advanced',
    duration: '3 hours',
    description: 'Create and optimize a Synapse Dedicated SQL Pool. Load data using COPY INTO, choose the right distribution strategy, and tune a slow query.',
    objectives: ['Provision a DW100c Dedicated SQL Pool', 'Create hash-distributed fact table and replicated dimension tables', 'Load 10M rows using COPY INTO from ADLS', 'Run EXPLAIN to see data movement', 'Tune a slow query using columnstore index statistics'],
    technologies: ['Azure Synapse Analytics', 'Azure ADLS Gen2', 'T-SQL', 'Azure Portal'],
    free: true,
  },
  {
    id: 'lab-7',
    title: 'ADF CI/CD with Azure DevOps',
    topic: 'DevOps',
    difficulty: 'Advanced',
    duration: '4 hours',
    description: 'Set up a full CI/CD pipeline for ADF using Azure DevOps. Configure source control, create deployment pipeline, and promote from Dev to Production.',
    objectives: ['Connect ADF to Azure Repos Git', 'Create an ADF YAML pipeline in Azure DevOps', 'Deploy ARM template from adf_publish branch', 'Configure environment-specific parameters', 'Set up approval gates for production deployment'],
    technologies: ['Azure Data Factory', 'Azure DevOps', 'ARM Templates', 'YAML Pipelines'],
    free: true,
  },
  {
    id: 'lab-8',
    title: 'Unity Catalog & Data Governance',
    topic: 'Governance',
    difficulty: 'Advanced',
    duration: '3 hours',
    description: 'Set up Unity Catalog in Databricks, configure data products with access control, implement column masking for PII, and track data lineage.',
    objectives: ['Configure Unity Catalog metastore', 'Create catalogs and schemas per domain', 'Implement column masking for PII data', 'Configure row-level security', 'View lineage in the Data Explorer'],
    technologies: ['Azure Databricks', 'Unity Catalog', 'Delta Lake', 'SQL'],
    free: true,
  },
];

const DIFF_COLORS = {
  Beginner: 'border-green-500/20 bg-green-500/5 text-green-400',
  Intermediate: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400',
  Advanced: 'border-red-500/20 bg-red-500/5 text-red-400',
};

export default function LabsPage() {
  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">Hands-On Labs</Badge>
          <h1 className="text-5xl font-bold mb-4">
            <span className="azure-gradient-text">Guided Labs</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Step-by-step hands-on labs with objectives, expected output, hints, and cleanup instructions.
            All labs use real Azure services (free tier where possible).
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Beginner Labs', count: LABS.filter(l => l.difficulty === 'Beginner').length, color: 'text-green-400' },
            { label: 'Intermediate Labs', count: LABS.filter(l => l.difficulty === 'Intermediate').length, color: 'text-yellow-400' },
            { label: 'Advanced Labs', count: LABS.filter(l => l.difficulty === 'Advanced').length, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-5 text-center">
              <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.count}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Labs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LABS.map((lab, i) => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
            >
              <Card className="h-full card-hover border-border/50">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs border ${DIFF_COLORS[lab.difficulty as keyof typeof DIFF_COLORS]}`}>
                          {lab.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{lab.duration}
                        </span>
                        <Badge variant="success" className="text-xs border">Free</Badge>
                      </div>
                      <h3 className="font-bold text-lg leading-tight">{lab.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{lab.topic}</p>
                    </div>
                    <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{lab.description}</p>

                  {/* Objectives */}
                  <div className="mb-4">
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Target className="w-3 h-3" />Lab Objectives
                    </div>
                    <div className="space-y-1">
                      {lab.objectives.slice(0, 3).map((obj, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ChevronRight className="w-3 h-3 text-[#0078d4] shrink-0" />
                          {obj}
                        </div>
                      ))}
                      {lab.objectives.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-5">+{lab.objectives.length - 3} more objectives</div>
                      )}
                    </div>
                  </div>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1 mb-5">
                    {lab.technologies.map(tech => (
                      <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <Link href={`/labs/${lab.id}`}>
                    <Button variant="gradient" className="w-full group">
                      Start Lab
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Azure Credits CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">☁️</div>
            <h2 className="text-2xl font-bold mb-3">Get Free Azure Credits</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              All labs can be completed with the Azure free tier ($200 credit for new accounts + always-free services).
              Microsoft also offers free sandbox environments through Microsoft Learn.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://azure.microsoft.com/en-us/free/" target="_blank" rel="noopener noreferrer">
                <Button variant="gradient">Get $200 Azure Credit</Button>
              </a>
              <a href="https://learn.microsoft.com/en-us/training/modules/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Microsoft Learn Sandboxes</Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
