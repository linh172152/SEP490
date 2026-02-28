'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BrainCircuit, ShieldCheck, HeartPulse } from 'lucide-react';

const roles = [
  {
    id: 'caregiver',
    title: 'Caregiver Portal',
    icon: HeartPulse,
    description: 'Empowering daily care professionals with real-time insights.',
    features: ['Live patient mood tracking', 'Medication compliance timelines', 'Instant crisis alerts']
  },
  {
    id: 'doctor',
    title: 'Clinical Hub',
    icon: BrainCircuit,
    description: 'Advanced psychiatric overview driven by predictive AI models.',
    features: ['Aggregate mood history charts', 'AI-driven risk escalation models', 'Deeper behavioral analytics']
  },
  {
    id: 'family',
    title: 'Family Connection',
    icon: ShieldCheck,
    description: 'Keeping loved ones informed and securely connected.',
    features: ['Simple visual status updates', 'Direct CareBot video calling', 'Rebellious peace of mind']
  },
  {
    id: 'admin',
    title: 'System Admin',
    icon: Activity,
    description: 'Comprehensive oversight of CareBot fleet and user access.',
    features: ['Fleet battery and status monitoring', 'Role-based access control', 'System uptime analytics']
  }
];

export function RoleShowcase() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary">Unified Ecosystem</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              One platform, multiple perspectives
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Whether you are a clinician requiring deep data, or a family member desiring simple reassurance, the interface adapts to your specific needs.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Tabs defaultValue="caregiver" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 h-auto p-1 bg-muted/50 rounded-xl">
              {roles.map((role) => (
                <TabsTrigger 
                  key={role.id} 
                  value={role.id}
                  className="py-3 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <role.icon className="mr-2 h-4 w-4 hidden sm:block" />
                  {role.title.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-primary/10 shadow-lg overflow-hidden relative bg-gradient-to-br from-background to-muted/20">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg group hover:bg-primary/20 transition-colors">
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <role.icon className="h-8 w-8 text-primary" />
                          </motion.div>
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{role.title}</CardTitle>
                          <CardDescription className="text-base mt-2">{role.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 border-t border-border/50">
                      <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Key Capabilities</h4>
                      <ul className="space-y-3">
                        {role.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-foreground/80">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mr-3 text-xs">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
