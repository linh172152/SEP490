'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, HeartPulse, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-24 pb-32 sm:pt-32 sm:pb-40">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/30 to-primary/10 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="relative flex items-center justify-center h-20 w-20 rounded-2xl bg-primary/10 shadow-sm border border-primary/20">
              <HeartPulse className="h-10 w-10 text-primary" />
              <motion.div 
                className="absolute inset-0 rounded-2xl border-2 border-primary"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-foreground"
          >
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Mental Health Care</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
          >
            CareBot-MH empowers caregivers, clinicians, and families with AI-driven insights and continuous compassionate robotic assistance for mental well-being.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Access Portal <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Feature Highlights beneath hero CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mx-auto mt-20 grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-2 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Cpu className="h-8 w-8 text-primary/70" />
              <span className="text-sm font-medium">Predictive AI Monitoring</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <HeartPulse className="h-8 w-8 text-primary/70" />
              <span className="text-sm font-medium">Real-time Emotion Sensing</span>
            </div>
            <div className="col-span-2 flex flex-col items-center justify-center gap-2 text-muted-foreground lg:col-span-1">
              <ShieldCheck className="h-8 w-8 text-primary/70" />
              <span className="text-sm font-medium">HIPAA Compliant Security</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
