'use client';

import { SettingsData, RoleCapabilities } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, Users, BellDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface RiskManagementSectionProps {
  settings: SettingsData;
  capabilities: RoleCapabilities;
  updateRiskManagement: (data: Partial<SettingsData['riskManagement']>) => Promise<void>;
  isSaving: boolean;
}

export function RiskManagementSection({ settings, capabilities, updateRiskManagement, isSaving }: RiskManagementSectionProps) {
  
  // Local state for slider so it slides smoothly before submitting
  const [threshold, setThreshold] = useState([settings.riskManagement.criticalThreshold]);

  if (!capabilities.canEditRiskThreshold) {
    return (
      <Card className="border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 border-dashed">
        <CardContent className="pt-6 pb-6 text-center">
          <ShieldAlert className="h-8 w-8 text-rose-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">Access Restricted</h3>
          <p className="text-sm text-rose-700 dark:text-rose-300 mt-2 max-w-md mx-auto">
            Your role does not have permission to modify clinical risk thresholds. 
            Please contact a supervising doctor or system administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSaveRiskSlider = () => {
    updateRiskManagement({ criticalThreshold: threshold[0] });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium text-rose-700 dark:text-rose-400 line-through decoration-destructive/50 opacity-60 italic">Risk Management Config</h3>
        <p className="text-sm text-muted-foreground">Adjust clinical AI sensitivities for escalation policies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-rose-100 dark:border-rose-900/50">
          <CardHeader>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500">
              <ShieldAlert className="h-5 w-5" />
              <CardTitle>Critical Escalation Threshold</CardTitle>
            </div>
            <CardDescription>
              Adjust the AI confidence score required to immediately flag a patient condition as critical.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
             <div className="space-y-4">
                 <div className="flex items-center justify-between">
                     <Label>AI Confidence Score</Label>
                     <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded dark:bg-rose-950 dark:text-rose-400">{threshold[0]}%</span>
                 </div>
                 <Slider 
                    value={threshold} 
                    max={100} 
                    min={50} 
                    step={1} 
                    onValueChange={setThreshold}
                    disabled={isSaving}
                    className="[&_[role=slider]]:bg-rose-600"
                 />
                 <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Lenient (50%)</span>
                    <span>Strict (100%)</span>
                 </div>
             </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 pt-4 border-t justify-end">
             <Button 
                onClick={handleSaveRiskSlider} 
                disabled={isSaving || threshold[0] === settings.riskManagement.criticalThreshold}
                variant="outline"
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
             >
                {isSaving ? 'Updating...' : 'Set New Threshold'}
             </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
            <Card>
            <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                <BellDot className="h-5 w-5" />
                <CardTitle>Global Alert Sensitivity</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <Select 
                    disabled={isSaving}
                    value={settings.riskManagement.alertSensitivity}
                    onValueChange={(val: 'low'|'medium'|'high') => updateRiskManagement({ alertSensitivity: val })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select sensitivity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low (Fewer alerts, highest certainty)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (Maximum visibility, more noise)</SelectItem>
                    </SelectContent>
                </Select>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                <CardTitle>Automated Delegation</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base">Auto-notify Caregiver</Label>
                    <p className="text-xs text-muted-foreground mr-4">
                    Send medium-risk non-medical alerts directly to the assigned caregiver first.
                    </p>
                </div>
                <Switch
                    disabled={isSaving}
                    checked={settings.riskManagement.autoNotifyCaregiver}
                    onCheckedChange={(val) => updateRiskManagement({ autoNotifyCaregiver: val })}
                />
                </div>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
