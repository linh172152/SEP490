'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, ArrowRight, Pencil, Trash2, Loader2, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { useElderlyProfileStore } from '@/store/useElderlyProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const elderlySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  healthNotes: z.string().min(5, 'Health notes must be at least 5 characters'),
  preferredLanguage: z.string().min(1, 'Please select a language'),
  speakingSpeed: z.string().min(1, 'Please select a speaking speed'),
});

type ElderlyFormValues = z.infer<typeof elderlySchema>;

export default function CaregiverElderlyPage() {
  const { user: caregiver } = useAuthStore();
  const { 
    profiles, 
    isLoading, 
    error,
    fetchProfiles, 
    createProfile, 
    updateProfile, 
    deleteProfile,
    generateDemoData
  } = useElderlyProfileStore();
  
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (caregiver?.id) {
      fetchProfiles(Number(caregiver.id));
    }
  }, [fetchProfiles, caregiver?.id]);

  const form = useForm<ElderlyFormValues>({
    resolver: zodResolver(elderlySchema),
    defaultValues: {
      name: '',
      dateOfBirth: '',
      healthNotes: '',
      preferredLanguage: 'Vietnamese',
      speakingSpeed: 'normal',
    },
  });

  const filteredMembers = useMemo(() => {
    return profiles.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.healthNotes.toLowerCase().includes(search.toLowerCase())
    );
  }, [profiles, search]);

  const handleOpenAdd = () => {
    setEditingId(null);
    form.reset({
      name: '',
      dateOfBirth: '',
      healthNotes: '',
      preferredLanguage: 'Vietnamese',
      speakingSpeed: 'normal',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (profile: any) => {
    setEditingId(profile.id);
    form.reset({
      name: profile.name,
      dateOfBirth: profile.dateOfBirth,
      healthNotes: profile.healthNotes,
      preferredLanguage: profile.preferredLanguage,
      speakingSpeed: profile.speakingSpeed,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ElderlyFormValues) => {
    if (!caregiver) return;
    try {
      if (editingId) {
        await updateProfile(editingId, data);
        toast.success('Profile updated successfully');
      } else {
        await createProfile(Number(caregiver.id), data);
        toast.success('Profile created successfully');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteProfile(id);
        toast.success('Profile deleted successfully');
      } catch (error) {
        toast.error('Failed to delete profile');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-6xl mx-auto pb-10"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Elderly Registry</h1>
          <p className="text-muted-foreground">Manage health records for your assigned elderly members.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {!isLoading && profiles.length === 0 && caregiver?.id ? (
            <Button variant="outline" onClick={() => generateDemoData(Number(caregiver.id))} className="shrink-0">
              Load Demo Data
            </Button>
          ) : null}
          <Button onClick={handleOpenAdd} className="shrink-0 bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add Elderly Member
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name or health notes..." 
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 h-12">
              <TableHead className="pl-6 font-semibold">Member</TableHead>
              <TableHead className="font-semibold">Health Notes</TableHead>
              <TableHead className="font-semibold text-center">Language / Speed</TableHead>
              <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredMembers.map((member) => (
                <motion.tr 
                  key={member.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-20 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors border-b last:border-0"
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 border-2 border-slate-100 ring-2 ring-white">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                        <AvatarFallback className="font-bold text-blue-600 bg-blue-50">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">{member.name}</span>
                        <span className="text-xs text-muted-foreground font-medium">Born: {member.dateOfBirth}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-xs truncate" title={member.healthNotes}>
                      {member.healthNotes}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {member.preferredLanguage}
                      </Badge>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Speed: {member.speakingSpeed}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(member)} className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)} className="h-9 w-9 text-slate-500 hover:text-rose-600 hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-950 rounded-lg h-9 px-4">
                        <Link href={`/dashboard/caregiver/elderly/${member.id}`}>
                          Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
            {!isLoading && filteredMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Plus className="h-10 w-10 text-slate-200" />
                    <p className="text-lg font-bold text-slate-400">No members found</p>
                    <p className="text-sm text-slate-400">Start by adding a new elderly profile or use demo data.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button variant="outline" onClick={() => caregiver?.id && generateDemoData(Number(caregiver.id))}>
                        Load Demo Data
                      </Button>
                      <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Add Elderly Member
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-slate-500">Loading members...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Elderly Profile' : 'Add New Elderly'}</DialogTitle>
            <DialogDescription>
              Enter the health details and communication preferences for the elderly member.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="healthNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Medical conditions, dietary requirements, medicines..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferredLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="speakingSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speaking Speed</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select speed" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="slow">Slow</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="fast">Fast</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingId ? 'Update Profile' : 'Create Profile'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
