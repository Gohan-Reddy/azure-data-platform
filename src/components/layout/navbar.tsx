'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, BookOpen, Map, Code2, Trophy, Briefcase, Award,
  Search, Menu, X, Sun, Moon, ChevronDown, Zap, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProgressStore } from '@/store/progress';
import { getLevel } from '@/lib/utils';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Roadmap', href: '/roadmap', icon: Map },
  {
    label: 'Learn',
    href: '/learn',
    icon: BookOpen,
    children: [
      { label: 'Python for DE', href: '/learn/python-core' },
      { label: 'SQL Masterclass', href: '/learn/sql-fundamentals' },
      { label: 'Azure Databricks', href: '/learn/azure-databricks' },
      { label: 'Delta Lake', href: '/learn/delta-lake' },
      { label: 'Azure Data Factory', href: '/learn/azure-data-factory' },
      { label: 'Spark Optimization', href: '/learn/spark-optimization' },
    ]
  },
  { label: 'Interview', href: '/interview', icon: Code2 },
  { label: 'Projects', href: '/projects', icon: Briefcase },
  { label: 'Certifications', href: '/certifications', icon: Award },
  { label: 'Labs', href: '/labs', icon: Zap },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const { xp, completedTopics } = useProgressStore();
  const levelInfo = getLevel(xp);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-lg'
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 azure-gradient rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/40 transition-shadow">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">
              <span className="azure-gradient-text">Azure</span>
              <span className="text-foreground"> DE Bible</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-[#0078d4]/10 text-[#0078d4]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.children && <ChevronDown className="w-3 h-3 ml-0.5" />}
                </Link>

                {/* Dropdown */}
                {item.children && (
                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-56 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-xl py-1"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-[#0078d4]/10 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                        <div className="border-t border-border mt-1 pt-1">
                          <Link
                            href="/learn"
                            className="block px-4 py-2 text-sm text-[#0078d4] font-medium hover:bg-[#0078d4]/10 transition-colors"
                          >
                            View All Topics →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* XP Display */}
            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0078d4]/10 hover:bg-[#0078d4]/20 transition-colors">
              <div className="w-5 h-5 rounded-full azure-gradient flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{levelInfo.level}</span>
              </div>
              <span className="text-sm font-medium text-[#0078d4]">{xp.toLocaleString()} XP</span>
              <span className="text-xs text-muted-foreground hidden lg:block">· {completedTopics.length} topics</span>
            </Link>

            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Link href="/dashboard">
              <Button variant="gradient" size="sm">
                <User className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === item.href
                      ? 'bg-[#0078d4]/10 text-[#0078d4]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 flex items-center gap-3">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="gradient" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="icon" onClick={toggleDarkMode}>
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
