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
    <div className={`min-h-screen flex ${isDark ? 'tech-grid bg-[#030806] text-slate-100' : 'bg-clinical-primary text-clinical-text'}`}>
      {/* Background Ambient Glow (Admin Only) */}
      {isDark && <div className="fixed inset-0 radial-glow pointer-events-none -z-10" />}

      {/* Desktop Sidebar (hidden on mobile, and ONLY for admin) */}
      {isDark && <Sidebar className="hidden md:flex" />}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 pb-20 md:pb-8 ${isDark ? 'md:ml-64' : ''}`}>
        <Topbar />

        <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
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

      {/* Mobile Bottom Navigation (Admin only) */}
      {isDark && <MobileNav />}
    </div>
  );
}
