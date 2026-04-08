'use client';

import { RoleCapabilities } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldX, CheckCircle2, XCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

interface RoleAccessSectionProps {
  capabilities: RoleCapabilities;
}

export function RoleAccessSection({ capabilities }: RoleAccessSectionProps) {
  
  // Mock feature toggle states for demo
  const [features, setFeatures] = useState({
     doctorBetaAccess: false,
     caregiverExportData: true,
     familyMobileApp: true
  });

  if (!capabilities.canAccessRoleAccess) {
    return (
      <Card className="border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 border-dashed">
        <CardContent className="pt-6 pb-6 text-center">
          <ShieldX className="h-8 w-8 text-rose-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">Access Restricted</h3>
          <p className="text-sm text-rose-700 dark:text-rose-300 mt-2 max-w-md mx-auto">
            You do not have Administrator privileges to view or modify role-based access control policies.
          </p>
        </CardContent>
      </Card>
    );
  }

  const roleDefinitions = [
    { role: 'ADMINISTRATOR', access: 'Unrestricted', users: 3 },
    { role: 'DOCTOR', access: 'Clinical + Read/Write', users: 15 },
    { role: 'CAREGIVER', access: 'Standard Operating', users: 42 },
    { role: 'FAMILYMEMBER', access: 'Read-only (Filtered)', users: 120 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium line-through decoration-destructive/50 opacity-60 italic">Role & Access Management</h3>
        <p className="text-sm text-muted-foreground">Configure system permissions and feature flags.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2">
           <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>Overview of active roles and their security clearance levels.</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900">
                            <TableHead>Role Name</TableHead>
                            <TableHead>Access Level</TableHead>
                            <TableHead className="text-right">Active Users</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roleDefinitions.map((rd) => (
                           <TableRow key={rd.role}>
                              <TableCell className="font-semibold">{rd.role}</TableCell>
                              <TableCell>
                                 <Badge variant="outline" className={rd.access === 'Unrestricted' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30' : ''}>
                                    {rd.access}
                                 </Badge>
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">{rd.users}</TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </div>
           </CardContent>
         </Card>

         <Card className="lg:col-span-1">
             <CardHeader>
                 <CardTitle>Feature Flags</CardTitle>
                 <CardDescription>Toggle beta features globally across the SaaS platform.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">New AI Insights UI (Doctors)</span>
                     <Switch checked={features.doctorBetaAccess} onCheckedChange={(v) => setFeatures({...features, doctorBetaAccess: v})} />
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">Allow Data Export (Caregivers)</span>
                     <Switch checked={features.caregiverExportData} onCheckedChange={(v) => setFeatures({...features, caregiverExportData: v})} />
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">Mobile App Access (Family)</span>
                     <Switch checked={features.familyMobileApp} onCheckedChange={(v) => setFeatures({...features, familyMobileApp: v})} />
                 </div>
             </CardContent>
         </Card>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Compliance Matrix Preview</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
              <div className="min-w-[600px] border rounded-lg p-6 bg-slate-50 dark:bg-slate-950 flex flex-col gap-4">
                  <div className="flex justify-between font-bold text-sm text-muted-foreground pb-2 border-b">
                      <span className="w-1/3">Capability</span>
                      <span className="w-1/6 text-center">Admin</span>
                      <span className="w-1/6 text-center">Doctor</span>
                      <span className="w-1/6 text-center">Caregiver</span>
                      <span className="w-1/6 text-center">Family</span>
                  </div>
                  {[
                      { cap: 'View Patient Vitals', a: true, d: true, c: true, f: true },
                      { cap: 'Modify Medications', a: true, d: true, c: false, f: false },
                      { cap: 'Access Audit Logs', a: true, d: false, c: false, f: false },
                      { cap: 'Manage Risk Thresholds', a: true, d: true, c: false, f: false }
                  ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-sm pb-2 border-b last:border-0 last:pb-0">
                           <span className="w-1/3 font-medium text-slate-700 dark:text-slate-300">{row.cap}</span>
                           <span className="w-1/6 flex justify-center">{row.a ? <CheckCircle2 className="h-4 w-4 text-emerald-500"/> : <XCircle className="h-4 w-4 text-rose-300"/>}</span>
                           <span className="w-1/6 flex justify-center">{row.d ? <CheckCircle2 className="h-4 w-4 text-emerald-500"/> : <XCircle className="h-4 w-4 text-rose-300"/>}</span>
                           <span className="w-1/6 flex justify-center">{row.c ? <CheckCircle2 className="h-4 w-4 text-emerald-500"/> : <XCircle className="h-4 w-4 text-rose-300"/>}</span>
                           <span className="w-1/6 flex justify-center">{row.f ? <CheckCircle2 className="h-4 w-4 text-emerald-500"/> : <XCircle className="h-4 w-4 text-rose-300"/>}</span>
                      </div>
                  ))}
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
