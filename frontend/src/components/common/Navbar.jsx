import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Activity, ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Intelligence', href: '#explainable-ai' },
    { name: 'Dashboard', href: '#dashboard-preview' },
    { name: 'About', href: '#guidance' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-[#030806]/85 backdrop-blur-md border-b border-emerald-500/15 py-3 shadow-glass-dark'
            : 'bg-white/85 backdrop-blur-md border-b border-emerald-600/15 py-3 shadow-glass-light'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Identity / Logo */}
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/10 border border-emerald-500/30 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:border-emerald-400">
              <Activity className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight flex items-center gap-1.5">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>HealthGuard</span>
                <span className="text-emerald-500 font-extrabold text-sm px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">AI</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Controls: Theme Toggle & CTA */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-emerald-soft transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg border ${
                isDark
                  ? 'border-emerald-500/20 text-slate-200 bg-emerald-950/20'
                  : 'border-slate-300 text-slate-800 bg-slate-100'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200 ${
            isDark
              ? 'bg-[#030806]/98 border-emerald-500/20 shadow-2xl'
              : 'bg-white/98 border-slate-200 shadow-2xl'
          }`}
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isDark
                    ? 'text-slate-200 hover:bg-emerald-950/40 hover:text-emerald-400'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-emerald-700'
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full text-sm font-semibold bg-emerald-500 text-black hover:bg-emerald-400"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
