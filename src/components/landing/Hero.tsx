'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, HeartPulse, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';

import { RobotIllustration } from '@/components/landing/RobotIllustration';

export function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const yBlob1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const yBlob2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-background pt-24 pb-32 sm:pt-32 sm:pb-40">
      {/* Animated Background Gradients & Blobs with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/50 to-background" />
        
        <motion.div
          style={{ y: yBlob1 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]"
        />
        
        <motion.div
          style={{ y: yBlob2 }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], x: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-20 -right-20 h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-[120px]"
        />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left flex flex-col justify-center"
          >
            <motion.div variants={staggerItem} className="flex justify-center lg:justify-start mb-6">
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
              variants={staggerItem}
              className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-foreground"
            >
              The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Mental Health Care</span>
            </motion.h1>
            
            <motion.p 
              variants={staggerItem}
              className="mx-auto lg:mx-0 mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
            >
              CareBot-MH empowers caregivers, clinicians, and families with AI-driven insights and continuous compassionate robotic assistance for mental well-being.
            </motion.p>
            
            <motion.div variants={staggerItem} className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
              <Link href="/login" className="relative group">
                <div className="absolute -inset-1 rounded-full bg-primary/50 blur-lg opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
                <Button size="lg" className="relative h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Access Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Feature Highlights beneath hero CTA */}
            <motion.div variants={staggerItem} className="mt-14 grid grid-cols-2 gap-y-8 sm:grid-cols-3 mx-auto lg:mx-0 max-w-lg lg:max-w-none items-start">
              <div className="flex flex-col items-center lg:items-start gap-2 text-muted-foreground group">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                  <Cpu className="h-8 w-8 text-primary/70 transition-colors group-hover:text-primary" />
                </motion.div>
                <span className="text-sm font-medium text-center lg:text-left transition-colors group-hover:text-foreground">Predictive AI Monitoring</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2 text-muted-foreground group">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                  <HeartPulse className="h-8 w-8 text-primary/70 transition-colors group-hover:text-primary" />
                </motion.div>
                <span className="text-sm font-medium text-center lg:text-left transition-colors group-hover:text-foreground">Real-time Emotion Sensing</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col items-center lg:items-start gap-2 text-muted-foreground group">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                  <ShieldCheck className="h-8 w-8 text-primary/70 transition-colors group-hover:text-primary" />
                </motion.div>
                <span className="text-sm font-medium text-center lg:text-left transition-colors group-hover:text-foreground">HIPAA Compliant Security</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Animated Robot Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center justify-center mt-10 lg:mt-0"
          >
            <RobotIllustration />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
