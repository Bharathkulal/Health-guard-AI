import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useTheme } from '../../context/ThemeContext';
import { DisclaimerCard } from '../common/DisclaimerCard';

export function AppShell() {
  const { isDark } = useTheme();
  const location = useLocation();

  return (
    <div className={`min-h-screen flex tech-grid ${isDark ? 'bg-[#030806] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 radial-glow pointer-events-none -z-10" />

      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 pb-20 md:pb-8">
        <Topbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>

          {/* Footer Decision Support Disclaimer */}
          <div className="pt-8">
            <DisclaimerCard compact />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <MobileNav />
    </div>
  );
}
