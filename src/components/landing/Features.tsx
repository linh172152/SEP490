'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BellRing, Link as LinkIcon, Lock, Sparkles, UserCheck } from 'lucide-react';

const features = [
  {
    name: 'Real-time Mood Analysis',
    description: 'Continuous non-intrusive monitoring of behavioral patterns and emotional states.',
    icon: Activity,
  },
  {
    name: 'AI Predictive Risk Detection',
    description: 'Advanced machine learning models forecast potential mental health crises before they escalate.',
    icon: Sparkles,
  },
  {
    name: 'Unbroken Family Connection',
    description: 'Secure, high-quality video links bridging the gap between isolated patients and their loved ones.',
    icon: LinkIcon,
  },
  {
    name: 'Smart Alert System',
    description: 'Instant notifications to caregivers for missed medications or unexpected mood drops.',
    icon: BellRing,
  },
  {
    name: 'Enterprise Grade Security',
    description: 'End-to-end encryption securing sensitive medical and emotional data records.',
    icon: Lock,
  },
  {
    name: 'Role-Based Access',
    description: 'Tailored dashboard perspectives ensuring privacy and relevance for every user type.',
    icon: UserCheck,
  },
];

export function Features() {
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
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary">Intelligent Care Delivery</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to support mental well-being
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              CareBot-MH integrates state-of-the-art robotics with an intuitive software suite designed specifically for mental health treatment protocols.
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
              <Card className="h-full border-0 shadow-md bg-background/50 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">{feature.name}</CardTitle>
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
