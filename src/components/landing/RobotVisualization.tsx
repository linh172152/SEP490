'use client';

import { motion } from 'framer-motion';
import { Bot, BatteryCharging, Wifi, ShieldAlert } from 'lucide-react';

export function RobotVisualization() {
  return (
    <section className="py-24 sm:py-32 bg-primary/5 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary">Meet CareBot</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Advanced robotics with a human touch
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Built with precision engineering, the CareBot hardware is designed to be approachable, durable, and highly responsive to its environment.
            </p>
            
            <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-muted-foreground lg:max-w-none">
              <div className="relative pl-9">
                <dt className="inline font-semibold text-foreground">
                  <Wifi className="absolute left-1 top-1 h-5 w-5 text-primary" />
                  Always Connected.
                </dt>{' '}
                <dd className="inline">Maintains a secure link to the clinical network, ensuring no data loss even in low-bandwidth scenarios.</dd>
              </div>
              <div className="relative pl-9">
                <dt className="inline font-semibold text-foreground">
                  <BatteryCharging className="absolute left-1 top-1 h-5 w-5 text-primary" />
                  Smart Charging.
                </dt>{' '}
                <dd className="inline">Automatically navigates to its charging bay when battery levels drop, ensuring 24/7 autonomous operation.</dd>
              </div>
              <div className="relative pl-9">
                <dt className="inline font-semibold text-foreground">
                  <ShieldAlert className="absolute left-1 top-1 h-5 w-5 text-primary" />
                  Safety First.
                </dt>{' '}
                <dd className="inline">Equipped with obstacle avoidance and soft-touch materials to prevent any accidental injury to patients.</dd>
              </div>
            </dl>
          </motion.div>

          <motion.div 
            className="relative flex justify-center items-center h-[500px]"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            {/* Ambient glowing background */}
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full mix-blend-multiply" />
            
            {/* The "Robot" abstract visualization */}
            <div className="relative h-80 w-80 bg-background rounded-full border border-primary/20 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 w-full h-1 bg-primary"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="flex space-x-6 items-center justify-center">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary overflow-hidden flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary animate-pulse" />
                </motion.div>
                
                <motion.div 
                  className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary overflow-hidden flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary animate-pulse" />
                </motion.div>
              </div>
              
              <div className="mt-8 relative w-32 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-primary"
                  animate={{ width: ['20%', '80%', '20%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <div className="absolute bottom-6 flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Bot className="h-4 w-4 text-primary" />
                SYSTEM_ONLINE
              </div>
            </div>
            
            {/* Floating connecting nodes */}
            <motion.div 
              className="absolute top-10 left-10 p-4 bg-background rounded-xl border shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Sensors Active</span>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-20 right-0 p-4 bg-background rounded-xl border shadow-lg"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm font-medium">Processing Data</span>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
