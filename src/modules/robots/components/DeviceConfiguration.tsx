'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Robot } from '@/types';
import { Settings2, Volume2, Mic2 } from 'lucide-react';
import { useRobotStore } from '@/store/useRobotStore';
import { toast } from 'sonner';

interface DeviceConfigurationProps {
  robot: Robot;
}

export function DeviceConfiguration({ robot }: DeviceConfigurationProps) {
  const { updateDeviceConfig } = useRobotStore();
  
  const [volume, setVolume] = useState([robot.settings.volume]);
  const [speechSpeed, setSpeechSpeed] = useState([robot.settings.speechSpeed * 100]);
  const [language, setLanguage] = useState(robot.settings.language);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
      setIsSaving(true);
      
      // Map it back to the proper scales
      await updateDeviceConfig(robot.id, {
          volume: volume[0],
          speechSpeed: speechSpeed[0] / 100,
          language
      });
      
      setIsSaving(false);
      toast.success("Device configuration synchronized via IoT hub.");
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
           <Settings2 className="h-5 w-5 text-indigo-500" />
           Device Configuration
        </CardTitle>
        <CardDescription>Over The Air (OTA) hardware parameter sync</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
         
         <div className="space-y-4">
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                     <Volume2 className="h-4 w-4 text-slate-500" />
                     <h4 className="font-bold text-sm">Output Volume</h4>
                 </div>
                 <span className="text-xs font-bold text-slate-500">{volume[0]}%</span>
             </div>
             <Slider 
                 value={volume} 
                 max={100} 
                 step={1} 
                 className="[&_[role=slider]]:bg-indigo-600"
                 onValueChange={setVolume} 
             />
             <p className="text-xs text-slate-500">Modifies the maximum output threshold of the robot's physical speaker.</p>
         </div>

         <div className="space-y-4">
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                     <Mic2 className="h-4 w-4 text-slate-500" />
                     <h4 className="font-bold text-sm">Speech Speed Rate</h4>
                 </div>
                 <span className="text-xs font-bold text-slate-500">{speechSpeed[0] / 100}x</span>
             </div>
             <Slider 
                 value={speechSpeed} 
                 min={50}
                 max={200} 
                 step={10} 
                 className="[&_[role=slider]]:bg-sky-600"
                 onValueChange={setSpeechSpeed} 
             />
             <p className="text-xs text-slate-500">Configures the generation speed of the text-to-speech module. Slower speeds are recommended for severe cognitive impairments.</p>
         </div>

         <div className="space-y-3">
            <h4 className="font-bold text-sm">Primary Interaction Language</h4>
            <Select value={language} onValueChange={setLanguage}>
                 <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Language" />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="vi-VN">Tiếng Việt (Vietnam)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                 </SelectContent>
            </Select>
         </div>

      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 flex justify-end p-4">
          <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
              {isSaving ? "Syncing to device..." : "Apply Configurations"}
          </Button>
      </CardFooter>
    </Card>
  );
}
