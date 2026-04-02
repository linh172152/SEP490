'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadCloud, FileText, Trash2, ShieldQuestion } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function DataExportSection() {
  const handleExport = () => {
    toast.success('Your data export has been initiated and will arrive via email shortly.');
  };

  const handleDeleteParams = () => {
    toast.error('Account deletion simulation: Admin approval explicitly required in this demo.');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium line-through decoration-destructive/50 opacity-60 italic">Data & Compliance</h3>
        <p className="text-sm text-muted-foreground">Manage your personal data, portability, and GDPR requirements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card>
            <CardHeader>
               <div className="flex items-center gap-2 text-primary">
                 <DownloadCloud className="h-5 w-5" />
                 <CardTitle>Export Account Data</CardTitle>
               </div>
               <CardDescription>
                  Request a downloaded copy of your personal data, preferences, and logs collected by CareBot-MH.
               </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-4 bg-sky-50 dark:bg-sky-950/20 rounded-lg flex gap-3 text-sm text-sky-800 dark:text-sky-300 border border-sky-100 dark:border-sky-900 border-dashed">
                    <FileText className="h-5 w-5 shrink-0" />
                    <p>The export includes your profile history, system preferences, and authentication logs in a structured JSON/CSV format.</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleExport} className="w-full sm:w-auto">Request Data Export</Button>
            </CardFooter>
         </Card>

         <Card className="border-rose-100 dark:border-rose-900/40">
            <CardHeader>
               <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500">
                 <Trash2 className="h-5 w-5" />
                 <CardTitle>Delete Account</CardTitle>
               </div>
               <CardDescription>
                  Permanently remove your account and all associated data from the platform.
               </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Once you delete your account, there is no going back. Please be certain.</p>
                    <p>In clinical settings, soft-deletion will apply to maintain strict medical log integrity.</p>
                 </div>
            </CardContent>
            <CardFooter>
                <AlertDialog>
                     <AlertDialogTrigger asChild>
                         <Button variant="destructive" className="w-full sm:w-auto">Delete Account</Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                       <AlertDialogHeader>
                         <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
                             <ShieldQuestion className="h-5 w-5" /> Are you absolutely sure?
                         </AlertDialogTitle>
                         <AlertDialogDescription>
                           This action cannot be undone. This will permanently delete your account and remove your active data from our servers.
                         </AlertDialogDescription>
                       </AlertDialogHeader>
                       <AlertDialogFooter>
                         <AlertDialogCancel>Cancel</AlertDialogCancel>
                         <AlertDialogAction 
                            onClick={handleDeleteParams}
                            className="bg-rose-600 hover:bg-rose-700"
                         >
                           Yes, format my data
                         </AlertDialogAction>
                       </AlertDialogFooter>
                     </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
         </Card>
      </div>
    </div>
  );
}
