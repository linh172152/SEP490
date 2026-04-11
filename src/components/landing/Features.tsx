'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  HeartPulse, 
  Cpu, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Users 
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from '@/components/ui/card';
import { useI18nStore } from '@/store/useI18nStore';

export function Features() {
  const { t } = useI18nStore();

  const features = [
    {
      name: t('landing.features.items.fleet.name', 'Fleet Operations'),
      description: t('landing.features.items.fleet.desc', 'Technical oversight of robot health, battery status, and OTA firmware updates across all units.'),
      icon: Cpu,
    },
    {
      name: t('landing.features.items.wellness.name', 'Wellness Library'),
      description: t('landing.features.items.wellness.desc', "Master catalog of physical and therapeutic exercise protocols (scripts) used by robotic care units."),
      icon: HeartPulse,
    },
    {
      name: t('landing.features.items.subscription.name', 'Subscription Control'),
      description: t('landing.features.items.subscription.desc', 'Commercial management of service packages, user plans, and revenue analytics for operations managers.'),
      icon: CreditCard,
    },
    {
      name: t('landing.features.items.tracking.name', 'Localized Tracking'),
      description: t('landing.features.items.tracking.desc', 'Precise room-based assignment system linking physical assets directly to specific residents and staff.'),
      icon: MapPin,
    },
    {
      name: t('landing.features.items.rbac.name', 'User Governance'),
      description: t('landing.features.items.rbac.desc', 'Secure role-based access control ensuring privacy and tailored perspectives for all platform personnel.'),
      icon: ShieldCheck,
    },
    {
      name: t('landing.features.items.family.name', 'Family Connectivity'),
      description: t('landing.features.items.family.desc', 'Peace of mind through real-time status updates and direct health summaries bridging seniors and loved ones.'),
      icon: Users,
    },
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const yBlob1 = useTransform(scrollYProgress, [0, 1], [-100, 200]);
  const yBlob2 = useTransform(scrollYProgress, [0, 1], [100, -150]);
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 bg-muted/30 overflow-hidden">
      {/* Subtle floating background elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          style={{ y: yBlob1 }}
          animate={{
            x: [0, -30, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[80px]"
        />
        <motion.div
          style={{ y: yBlob2 }}
          animate={{
            x: [0, 40, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-300/10 blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-widest">
              {t('landing.features.badge', 'Intelligent Care Delivery')}
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t('landing.features.title', 'Comprehensive Support System')}
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {t('landing.features.desc', 'CareBot-MH integrates state-of-the-art robotics with an intuitive software suite designed specifically for institutional and home-based care protocols.')}
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div key={feature.name} variants={item}>
              <Card className="h-full border border-border/50 shadow-md bg-background/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(var(--primary),0.15)] group">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl transition-colors group-hover:text-primary">{feature.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-7">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
