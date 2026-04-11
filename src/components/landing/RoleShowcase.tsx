'use client';

import { motion } from 'framer-motion';
import { 
  HeartPulse, 
  Users, 
  MessageSquare, 
  ShieldCheck 
} from 'lucide-react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { useI18nStore } from '@/store/useI18nStore';

export function RoleShowcase() {
  const { t } = useI18nStore();

  const roles = [
    {
      id: 'caregiver',
      name: t('landing.roles.tabs.caregiver', 'Caregiver'),
      title: t('landing.roles.caregiver.title', 'Caregiver (WIP)'),
      description: t('landing.roles.caregiver.desc', 'Direct professional support for daily resident care routines.'),
      features: [
        t('landing.roles.caregiver.features.0', 'Assigned Resident Health Alerts'),
        t('landing.roles.caregiver.features.1', 'Task Reminders & Robot Controls'),
        t('landing.roles.caregiver.features.2', 'Real-time Behavior Monitoring'),
      ],
      icon: HeartPulse,
    },
    {
      id: 'family',
      name: t('landing.roles.tabs.family', 'Family'),
      title: t('landing.roles.family.title', 'Family Member (WIP)'),
      description: t('landing.roles.family.desc', 'Direct connection and peace of mind for loved ones.'),
      features: [
        t('landing.roles.family.features.0', 'Automated Progress Summaries'),
        t('landing.roles.family.features.1', 'Video Connection Requests'),
        t('landing.roles.family.features.2', 'Direct Health Observation Feed'),
      ],
      icon: MessageSquare,
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-background relative overflow-hidden">
       {/* Background decorative element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-widest">
              {t('landing.roles.badge', 'One Ecosystem')}
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t('landing.roles.title', 'Tailored Perspectives')}
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {t('landing.roles.desc', 'Our platform adapts seamlessly to every role in the care circle, from infrastructure oversight to daily compassionate care.')}
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
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 h-auto p-1 bg-muted/50 rounded-2xl border border-border/50">
              {roles.map((role) => (
                <TabsTrigger 
                  key={role.id} 
                  value={role.id}
                  className="py-3 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg rounded-xl transition-all font-medium"
                >
                  <role.icon className="mr-2 h-4 w-4 hidden sm:block" />
                  {role.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id} className="outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-primary/10 shadow-xl overflow-hidden relative bg-gradient-to-br from-background to-muted/20 rounded-3xl">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <CardHeader className="pb-6 pt-10 px-8 sm:px-12">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="p-4 bg-primary/10 rounded-2xl group transition-colors shadow-inner">
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <role.icon className="h-10 w-10 text-primary" />
                          </motion.div>
                        </div>
                        <div>
                          <CardTitle className="text-3xl font-black text-foreground">{role.title}</CardTitle>
                          <CardDescription className="text-lg mt-3 text-muted-foreground/80 font-medium">{role.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-12 pt-6 px-8 sm:px-12 border-t border-border/40 bg-background/30 backdrop-blur-sm">
                      <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-primary/70">Key Capabilities</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {role.features.map((feature, idx) => (
                          <motion.li 
                            key={idx} 
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="flex items-center text-foreground font-semibold bg-muted/50 p-4 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mr-4 text-xs shadow-sm">✓</span>
                            {feature}
                          </motion.li>
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
