import Link from 'next/link';
import { Cloud, Code2, Share2, Users, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 azure-gradient rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">Azure DE Bible</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The most comprehensive Azure Data Engineering learning platform. From beginner to Senior DE.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Code2 className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Users className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Learning */}
          <div>
            <h4 className="font-semibold mb-4">Learning</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/roadmap" className="hover:text-foreground transition-colors">Learning Roadmap</Link></li>
              <li><Link href="/learn" className="hover:text-foreground transition-colors">All Topics</Link></li>
              <li><Link href="/labs" className="hover:text-foreground transition-colors">Hands-on Labs</Link></li>
              <li><Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link></li>
              <li><Link href="/cheatsheets" className="hover:text-foreground transition-colors">Cheat Sheets</Link></li>
            </ul>
          </div>

          {/* Interview */}
          <div>
            <h4 className="font-semibold mb-4">Interview Prep</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/interview" className="hover:text-foreground transition-colors">Question Banks</Link></li>
              <li><Link href="/interview?cat=sql" className="hover:text-foreground transition-colors">SQL (80 Questions)</Link></li>
              <li><Link href="/interview?cat=spark" className="hover:text-foreground transition-colors">Spark (60 Questions)</Link></li>
              <li><Link href="/interview?cat=azure" className="hover:text-foreground transition-colors">Azure (50 Questions)</Link></li>
              <li><Link href="/interview?cat=scenario" className="hover:text-foreground transition-colors">System Design</Link></li>
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h4 className="font-semibold mb-4">Certifications</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/certifications/dp-203" className="hover:text-foreground transition-colors">DP-203 Data Engineering</Link></li>
              <li><Link href="/certifications/az-900" className="hover:text-foreground transition-colors">AZ-900 Azure Fundamentals</Link></li>
              <li><Link href="/certifications/dp-900" className="hover:text-foreground transition-colors">DP-900 Data Fundamentals</Link></li>
              <li><Link href="/certifications/ai-900" className="hover:text-foreground transition-colors">AI-900 AI Fundamentals</Link></li>
              <li><Link href="/resources" className="hover:text-foreground transition-colors">Free Resources</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Azure DE Bible. Built for the Azure Data Engineering community.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for aspiring Data Engineers
          </p>
        </div>
      </div>
    </footer>
  );
}
