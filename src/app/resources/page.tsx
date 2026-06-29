'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Video, GitBranch, Globe, FileText, Code2, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const RESOURCES = [
  // Python
  { title: 'Python Official Documentation', url: 'https://docs.python.org/3/', type: 'docs', category: 'Python', free: true, rating: 5, description: 'The official Python docs — always the most accurate source' },
  { title: 'Real Python', url: 'https://realpython.com', type: 'course', category: 'Python', free: false, rating: 5, description: 'In-depth Python tutorials for professionals' },
  { title: 'Fluent Python (Book)', url: 'https://www.oreilly.com/library/view/fluent-python-2nd/9781492056232/', type: 'book', category: 'Python', free: false, rating: 5, description: 'The definitive advanced Python book' },
  // SQL
  { title: 'StrataScratch - SQL Practice', url: 'https://stratascratch.com', type: 'practice', category: 'SQL', free: false, rating: 5, description: '290+ real interview SQL problems from top companies' },
  { title: 'LeetCode Database', url: 'https://leetcode.com/problemset/database/', type: 'practice', category: 'SQL', free: true, rating: 5, description: '80+ SQL problems including Hard tier' },
  { title: 'Use The Index, Luke', url: 'https://use-the-index-luke.com', type: 'book', category: 'SQL', free: true, rating: 5, description: 'Free online book on SQL indexing and performance' },
  { title: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/introduction-to-sql/', type: 'course', category: 'SQL', free: true, rating: 4, description: 'Excellent interactive SQL tutorial including window functions' },
  // Azure
  { title: 'Microsoft Learn - Azure', url: 'https://learn.microsoft.com/en-us/azure/', type: 'course', category: 'Azure', free: true, rating: 5, description: 'Official Microsoft learning paths — directly aligned to certifications' },
  { title: 'Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/', type: 'docs', category: 'Azure', free: true, rating: 5, description: 'Reference architectures, patterns, and best practices' },
  { title: 'Azure Free Account', url: 'https://azure.microsoft.com/en-us/free/', type: 'lab', category: 'Azure', free: true, rating: 5, description: '$200 free credit for 30 days + always-free services' },
  // ADF
  { title: 'ADF Documentation', url: 'https://learn.microsoft.com/en-us/azure/data-factory/', type: 'docs', category: 'ADF', free: true, rating: 5, description: 'Official ADF documentation with tutorials' },
  { title: 'ADF on GitHub (Samples)', url: 'https://github.com/Azure/Azure-DataFactory', type: 'github', category: 'ADF', free: true, rating: 4, description: 'Official ADF sample pipelines and ARM templates' },
  // Databricks
  { title: 'Databricks Academy', url: 'https://www.databricks.com/learn/training', type: 'course', category: 'Databricks', free: true, rating: 5, description: 'Free Databricks courses and learning paths' },
  { title: 'Delta Lake Documentation', url: 'https://docs.delta.io/latest/index.html', type: 'docs', category: 'Databricks', free: true, rating: 5, description: 'Official Delta Lake documentation' },
  { title: 'Databricks YouTube Channel', url: 'https://www.youtube.com/c/Databricks', type: 'video', category: 'Databricks', free: true, rating: 5, description: 'Data+AI Summit talks, tutorials, demos' },
  // Spark
  { title: 'Apache Spark Documentation', url: 'https://spark.apache.org/docs/latest/', type: 'docs', category: 'Spark', free: true, rating: 5, description: 'Official Spark 3.x documentation' },
  { title: 'Learning Spark (Book)', url: 'https://www.oreilly.com/library/view/learning-spark-2nd/9781492050032/', type: 'book', category: 'Spark', free: false, rating: 5, description: 'Comprehensive Spark 3 book by Databricks engineers' },
  { title: 'Spark: The Definitive Guide', url: 'https://www.oreilly.com/library/view/spark-the-definitive/9781491912201/', type: 'book', category: 'Spark', free: false, rating: 5, description: 'Deep dive into Spark internals by the Databricks team' },
  // Streaming
  { title: 'Azure Event Hubs Docs', url: 'https://learn.microsoft.com/en-us/azure/event-hubs/', type: 'docs', category: 'Streaming', free: true, rating: 5, description: 'Official Event Hubs documentation' },
  { title: 'Flink Forward (YouTube)', url: 'https://www.youtube.com/c/ApacheFlink', type: 'video', category: 'Streaming', free: true, rating: 4, description: 'Streaming architecture talks and tutorials' },
  // DevOps
  { title: 'Azure DevOps Documentation', url: 'https://learn.microsoft.com/en-us/azure/devops/', type: 'docs', category: 'DevOps', free: true, rating: 5, description: 'Official Azure DevOps documentation' },
  { title: 'Terraform Azure Provider', url: 'https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs', type: 'docs', category: 'DevOps', free: true, rating: 5, description: 'Complete Terraform AzureRM provider documentation' },
  // Communities
  { title: 'r/dataengineering', url: 'https://www.reddit.com/r/dataengineering/', type: 'community', category: 'Community', free: true, rating: 4, description: '200k+ DE community on Reddit' },
  { title: 'Microsoft Tech Community - DE', url: 'https://techcommunity.microsoft.com/t5/azure-data-engineering/bg-p/AzureDataEngineering', type: 'community', category: 'Community', free: true, rating: 5, description: 'Microsoft\'s official Azure DE community blog' },
  { title: 'Seattle Data Guy (YouTube)', url: 'https://www.youtube.com/c/SeattleDataGuy', type: 'video', category: 'Community', free: true, rating: 5, description: 'Data engineering career advice and technical content' },
];

const CATEGORIES = ['All', 'Python', 'SQL', 'Azure', 'ADF', 'Databricks', 'Spark', 'Streaming', 'DevOps', 'Community'];
const TYPES = ['All', 'docs', 'course', 'video', 'book', 'practice', 'github', 'lab', 'community'];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  docs: <FileText className="w-4 h-4" />,
  course: <BookOpen className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
  practice: <Code2 className="w-4 h-4" />,
  github: <GitBranch className="w-4 h-4" />,
  lab: <Code2 className="w-4 h-4" />,
  community: <Globe className="w-4 h-4" />,
};

export default function ResourcesPage() {
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [onlyFree, setOnlyFree] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = RESOURCES.filter(r =>
    (category === 'All' || r.category === category) &&
    (type === 'All' || r.type === type) &&
    (!onlyFree || r.free) &&
    (!search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-[#0078d4]/30 text-[#0078d4]">Curated Resources</Badge>
          <h1 className="text-5xl font-bold mb-4">
            Learning <span className="azure-gradient-text">Resources</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Curated links to the best documentation, courses, books, YouTube channels, and practice platforms for every Azure DE topic.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0078d4] transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} className={cn(
                'px-4 py-1.5 rounded-full text-sm border transition-all',
                category === cat ? 'bg-[#0078d4] text-white border-[#0078d4]' : 'border-border text-muted-foreground hover:border-[#0078d4]/30'
              )}>{cat}</button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Type:</span>
            {TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} className={cn(
                'px-3 py-1 rounded-lg text-xs border transition-all capitalize',
                type === t ? 'bg-secondary text-foreground border-border' : 'border-border/50 text-muted-foreground hover:border-border'
              )}>{t}</button>
            ))}
            <button
              onClick={() => setOnlyFree(!onlyFree)}
              className={cn(
                'ml-auto px-4 py-1.5 rounded-full text-sm border transition-all',
                onlyFree ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'border-border text-muted-foreground hover:border-green-500/30'
              )}
            >
              🆓 Free Only
            </button>
            <span className="text-sm text-muted-foreground">{filtered.length} resources</span>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="group block h-full">
                <Card className="h-full card-hover border-border/50 hover:border-[#0078d4]/30 bg-background/50 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {TYPE_ICONS[resource.type] || <Globe className="w-4 h-4" />}
                        <span className="text-xs capitalize">{resource.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={resource.free ? 'success' : 'warning'} className="text-xs border">
                          {resource.free ? 'Free' : 'Paid'}
                        </Badge>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#0078d4] transition-colors" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm mb-2 group-hover:text-[#0078d4] transition-colors">{resource.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{resource.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                      <div className="flex items-center gap-0.5 ml-auto">
                        {Array.from({ length: resource.rating }).map((_, j) => (
                          <div key={j} className="w-2 h-2 rounded-full bg-yellow-400" />
                        ))}
                        {Array.from({ length: 5 - resource.rating }).map((_, j) => (
                          <div key={j} className="w-2 h-2 rounded-full bg-secondary" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
