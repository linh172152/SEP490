'use client';

import { useEffect } from 'react';
import { useElderlyStore } from '@/store/useElderlyStore';
import { AlertSeverity } from '@/types';

export function useAlertSimulation() {
    const { elderlyList, addAlert } = useElderlyStore();

    useEffect(() => {
        if (!elderlyList.length) return;

        const interval = setInterval(() => {
            // 10% chance to generate an alert every 30 seconds
            if (Math.random() > 0.9) {
                const randomElderly = elderlyList[Math.floor(Math.random() * elderlyList.length)];

                const types = [
                    { type: 'mood_drop', severity: 'medium' as AlertSeverity, message: 'Sudden mood drop detected. Patient appears sad or withdrawn.' },
                    { type: 'heart_rate_abnormal', severity: 'high' as AlertSeverity, message: 'Heart rate fluctuated outside normal range (105 BPM).' },
                    { type: 'emergency', severity: 'critical' as AlertSeverity, message: 'Emergency SOS button pressed or fall detection triggered!' }
                ];

                const randomType = types[Math.floor(Math.random() * types.length)];

                addAlert(randomElderly.id, {
                    type: randomType.type as any,
                    severity: randomType.severity,
                    message: randomType.message
                });

                console.log(`[Alert Simulation] Generated ${randomType.severity} alert for ${randomElderly.name}`);
            }
        }, 30000); // Check every 30s

        return () => clearInterval(interval);
    }, [elderlyList, addAlert]);
}
