import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Shield, Activity, ArrowRight, ArrowDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Footer } from '../components/common/Footer';

export function LandingPage() {
  const { scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#18201C] font-sans selection:bg-[#16805F] selection:text-white overflow-x-hidden">
      
      {/* NAVBAR */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#F7F4EE]/90 backdrop-blur-md border-b border-[#E5E0D7] py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded flex items-center justify-center text-[#16805F]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M12 16s3-2.5 3-5a3 3 0 0 0-6 0c0 2.5 3 5 3 5z" fill="currentColor"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#18201C]">HealthGuard <span className="font-normal">AI</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-10 text-[15px] font-medium">
            <div className="relative group cursor-pointer text-[#16805F]">
              <span>Home</span>
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#16805F] rounded-full"></div>
            </div>
            <a href="#how-it-works" className="text-[#66706A] hover:text-[#18201C] transition-colors">How It Works</a>
            <a href="#about" className="text-[#66706A] hover:text-[#18201C] transition-colors">About</a>
          </nav>

          <Link
            to="/assessment"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[15px] font-semibold bg-[#16805F] text-white hover:bg-[#126b4f] transition-all shadow-sm"
          >
            Start Assessment <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </motion.header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-0 md:pt-40 px-6 md:px-16 lg:px-24 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row items-center">
          
          <div className="w-full md:w-[45%] relative z-10 space-y-8 pb-20">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F2ED] text-[#16805F] text-[11px] font-bold tracking-wide uppercase border border-[#16805F]/10">
                AI-POWERED HEALTH ASSESSMENT
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-[4rem] md:text-[5rem] lg:text-[6rem] font-bold leading-[1.05] tracking-tight text-[#18201C]">
                Your Health<br />
                <span className="text-[#16805F]">Has a Story.</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-[#66706A] max-w-[420px] font-medium leading-relaxed">
                Understand the signals behind your health with an AI-assisted early risk assessment.
              </motion.p>
              
              <motion.div variants={fadeUp} className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Link
                  to="/assessment"
                  className="px-8 py-3.5 rounded-full font-semibold bg-[#16805F] text-white hover:bg-[#126b4f] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  Begin Assessment <ArrowRight className="w-4 h-4" />
                </Link>
                
                <a href="#how-it-works" className="text-[15px] font-medium text-[#66706A] hover:text-[#18201C] flex items-center gap-3 transition-colors">
                  <div className="w-10 h-10 rounded-full border border-[#E5E0D7] flex items-center justify-center bg-white shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#16805F] ml-1">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                  Explore how it works
                </a>
              </motion.div>
            </motion.div>
          </div>

          <div className="w-full md:w-[55%] relative flex justify-center items-end self-end">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-[800px] flex items-end justify-center"
            >
              <img 
                src="/hero-image.png" 
                alt="HealthGuard AI Risk Overview Dashboard" 
                className="w-full h-auto object-contain scale-[1.05] translate-y-[2%]"
              />
            </motion.div>
          </div>
        </section>

        {/* HERO BOTTOM FEATURES BAR */}
        <div className="relative w-full bg-[#FFFDF9] z-20">
          {/* Subtle curved top edge */}
          <div className="absolute top-0 left-0 w-full overflow-hidden transform -translate-y-[99%]">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-sm">
              <path d="M0 120L1440 120V0C1440 0 1150 119.5 720 119.5C290 119.5 0 0 0 0V120Z" fill="#FFFDF9"/>
            </svg>
          </div>
          
          <div className="w-full max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E5E0D7]/50">
              
              <div className="flex items-center gap-5 px-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F2ED] flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16805F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#18201C] mb-1">AI-Assisted Assessment</h3>
                  <p className="text-[13px] text-[#66706A] font-medium leading-snug">Data-driven health risk evaluation.</p>
                </div>
              </div>

              <div className="flex items-center gap-5 px-4 md:px-8">
                <div className="w-12 h-12 rounded-full bg-[#E8F2ED] flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16805F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <path d="M16 13H8"/>
                    <path d="M16 17H8"/>
                    <path d="M10 9H8"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#18201C] mb-1">Clear Explanations</h3>
                  <p className="text-[13px] text-[#66706A] font-medium leading-snug">Understand the factors behind<br/>your result.</p>
                </div>
              </div>

              <div className="flex items-center gap-5 px-4 md:px-8">
                <div className="w-12 h-12 rounded-full bg-[#E8F2ED] flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16805F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#18201C] mb-1">Assessment History</h3>
                  <p className="text-[13px] text-[#66706A] font-medium leading-snug">Review previous assessments<br/>over time.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SECTION 1: HEALTH SIGNALS */}
        <section className="py-24 px-6 md:px-16 lg:px-24 w-full max-w-[1600px] mx-auto border-t border-[#E5E0D7]/50">
          <div className="relative text-center py-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="relative z-10"
            >
              <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tight text-[#18201C] leading-none mb-6">
                YOUR BODY<br />
                ALREADY GIVES<br />
                YOU SIGNALS.
              </motion.h2>
            </motion.div>
            
            {/* Decorative nodes surrounding the text */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="absolute top-10 left-[20%] text-[10px] font-bold text-[#16805F] uppercase flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-[#16805F]" /> Blood Pressure
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-10 right-[20%] text-[10px] font-bold text-[#16805F] uppercase flex items-center gap-2"
              >
                Heart Rate <div className="w-2 h-2 rounded-full bg-[#16805F]" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute top-1/2 left-[10%] text-[10px] font-bold text-[#16805F] uppercase flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-[#16805F]" /> BMI
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute top-[20%] right-[15%] text-[10px] font-bold text-[#16805F] uppercase flex items-center gap-2"
              >
                Lifestyle <div className="w-2 h-2 rounded-full bg-[#16805F]" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 2: FROM INFORMATION TO INSIGHT */}
        <section id="how-it-works" className="py-24 px-6 md:px-16 lg:px-24 bg-[#FFFDF9] border-y border-[#E5E0D7]">
          <div className="max-w-5xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black tracking-tight text-[#18201C] mb-16 text-center md:text-left"
            >
              FROM INFORMATION<br />TO INSIGHT.
            </motion.h2>

            <div className="relative flex flex-col md:flex-row justify-between gap-12 md:gap-4">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-0.5 bg-[#E5E0D7]">
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-[#16805F] origin-left"
                />
              </div>

              {/* Connecting Line (Mobile) */}
              <div className="md:hidden absolute top-0 bottom-0 left-[24px] w-0.5 bg-[#E5E0D7]">
                <motion.div 
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="w-full bg-[#16805F] origin-top"
                />
              </div>

              {/* Steps */}
              {[
                { num: '01', title: 'YOUR INFORMATION', desc: 'Health, Lifestyle & Family History inputs.' },
                { num: '02', title: 'ML ANALYSIS', desc: 'Pattern recognition & risk evaluation algorithms.' },
                { num: '03', title: 'HEALTH INSIGHT', desc: 'Actionable categorization: Low, Moderate, or High risk.' }
              ].map((step, idx) => (
                <motion.div 
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.3 }}
                  className="relative z-10 flex flex-row md:flex-col items-center md:items-start gap-6 md:gap-4 w-full md:w-1/3 pl-12 md:pl-0"
                >
                  <div className="absolute left-0 md:relative md:left-auto w-12 h-12 md:w-20 md:h-20 rounded-full bg-[#FFFDF9] border-2 border-[#16805F] flex items-center justify-center text-xl md:text-2xl font-black text-[#16805F] shadow-sm">
                    {step.num}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm md:text-base font-bold text-[#18201C] mb-2">{step.title}</h3>
                    <p className="text-xs md:text-sm text-[#66706A] font-medium leading-relaxed max-w-[200px]">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: THE HEALTH PROFILE */}
        <section id="why-healthguard" className="py-24 px-6 md:px-16 lg:px-24 w-full max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 space-y-6">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-black tracking-tight text-[#18201C] leading-none"
              >
                SEE THE BIGGER<br />PICTURE.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-[#66706A] font-medium max-w-md"
              >
                Instead of isolated data points, view your health as a comprehensive, interconnected profile.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex-1 w-full"
            >
              <div className="bg-white rounded-3xl p-8 border border-[#E5E0D7] shadow-sm relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#E8F2ED] text-[#16805F] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  Example Assessment
                </div>
                
                <h3 className="text-xs font-bold text-[#66706A] uppercase tracking-widest mb-8 border-b border-[#E5E0D7] pb-4">
                  Health Profile
                </h3>

                <div className="space-y-6">
                  {/* Row 1 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D7]/50 pb-4">
                    <span className="text-lg font-bold text-[#18201C]">Heart Disease</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F2ED] text-[#16805F] w-fit">Low Risk</span>
                  </div>
                  {/* Row 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D7]/50 pb-4">
                    <span className="text-lg font-bold text-[#18201C]">Diabetes</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#B7791F] border border-amber-200/50 w-fit">Moderate Risk</span>
                  </div>
                  {/* Row 3 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D7]/50 pb-4">
                    <span className="text-lg font-bold text-[#18201C]">Blood Pressure</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F2ED] text-[#16805F] w-fit">Low Risk</span>
                  </div>
                  {/* Row 4 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-lg font-bold text-[#18201C]">Lifestyle</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#66706A] w-fit">Needs Attention</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 4: EXPLAINABILITY */}
        <section className="py-24 px-6 md:px-16 lg:px-24 bg-[#FFFDF9] border-y border-[#E5E0D7]">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#18201C] mb-4">
                A RESULT<br />SHOULD MAKE SENSE.
              </h2>
              <p className="text-lg text-[#66706A] font-medium max-w-xl mx-auto">
                Understand exactly what contributed to your assessment, avoiding the "black box" of traditional AI tools.
              </p>
            </motion.div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#F7F4EE] px-6 py-4 rounded-2xl border border-[#E5E0D7] font-bold text-[#18201C]"
              >
                Risk Assessment
              </motion.div>
              <ArrowRight className="w-6 h-6 text-[#16805F] hidden md:block" />
              <ArrowDown className="w-6 h-6 text-[#16805F] md:hidden" />
              
              <div className="flex flex-col gap-3">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white px-4 py-2 rounded-lg border border-[#E5E0D7] text-sm font-bold text-[#66706A] flex items-center gap-2 shadow-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C24141]" /> Blood Pressure
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white px-4 py-2 rounded-lg border border-[#E5E0D7] text-sm font-bold text-[#66706A] flex items-center gap-2 shadow-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B7791F]" /> Physical Activity
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white px-4 py-2 rounded-lg border border-[#E5E0D7] text-sm font-bold text-[#66706A] flex items-center gap-2 shadow-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#16805F]" /> Family History
                </motion.div>
              </div>

              <ArrowRight className="w-6 h-6 text-[#16805F] hidden md:block" />
              <ArrowDown className="w-6 h-6 text-[#16805F] md:hidden" />

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="bg-[#16805F] text-white px-6 py-4 rounded-2xl shadow-sm font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-[#E8F2ED]" /> Clear Explanation
              </motion.div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 px-6 md:px-16 lg:px-24 max-w-4xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-[#18201C] mb-6 leading-none">
              START UNDERSTANDING<br />YOUR HEALTH.
            </h2>
            <p className="text-xl text-[#66706A] font-medium max-w-2xl mx-auto mb-10">
              Take a few minutes to provide your health information and receive an AI-assisted early risk assessment.
            </p>
            
            <Link
              to="/assessment"
              className="inline-flex items-center justify-center px-10 py-5 rounded-full text-lg font-black bg-[#16805F] text-white hover:bg-[#126b4f] transition-all transform hover:-translate-y-1 hover:shadow-lg shadow-md group gap-3"
            >
              Begin Health Assessment 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="mt-12 text-xs text-[#66706A] max-w-lg mx-auto leading-relaxed font-medium">
              For informational purposes only. HealthGuard AI does not diagnose medical conditions or replace professional medical advice. Always consult a healthcare professional.
            </p>
          </motion.div>
        </section>
      </main>

      {/* OVERRIDE FOOTER BG IF NEEDED */}
      <div className="bg-[#FFFDF9] border-t border-[#E5E0D7]">
        <Footer />
      </div>
    </div>
  );
}
