'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronLeft, UserPlus, Save, HeartPulse, MapPin, Phone } from 'lucide-react';
import { useElderlyStore } from '@/store/useElderlyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { mockUsers } from '@/services/mock';
import Link from 'next/link';

// Schema for the form
const elderlyFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Age is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  condition: z.string().min(1, 'Medical condition is required'),
  address: z.string().min(1, 'Address is required'),
  emergencyContact: z.string().min(1, 'Emergency contact is required'),
  caregiverId: z.string().min(1, 'Caregiver assignment is required'),
  email: z.string().email('Invalid email address'),
});

type ElderlyFormValues = z.infer<typeof elderlyFormSchema>;

export default function CreateElderlyPage() {
  const router = useRouter();
  const { user: familyMember } = useAuthStore();
  const createElderly = useElderlyStore((state) => state.createElderly);
  
  const mockCaregivers = mockUsers.filter(u => u.role === 'CAREGIVER');

  const form = useForm<ElderlyFormValues>({
    resolver: zodResolver(elderlyFormSchema),
    defaultValues: {
      name: '',
      age: 70,
      gender: 'MALE',
      condition: '',
      address: '',
      emergencyContact: '',
      caregiverId: '',
      email: '',
    },
  });

  function onSubmit(data: ElderlyFormValues) {
    if (!familyMember) {
      toast.error('Session expired', { description: 'Please login again.' });
      return;
    }

    createElderly({
      ...data,
      familyId: familyMember.id,
    });

    toast.success('Member Added', {
      description: `${data.name} has been added to your Care Circle.`,
    });
    
    router.push('/dashboard/family');
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/family">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/dashboard/family" className="hover:text-foreground">Portal</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Create Circle</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Register New Member</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-lg flex items-center gap-2 text-sky-600">
                <UserPlus className="h-5 w-5" />
                Personal Profile
              </CardTitle>
              <CardDescription>Basic information for identification.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Official Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="family@contact.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-lg flex items-center gap-2 text-rose-500">
                <HeartPulse className="h-5 w-5" />
                Medical Oversight
              </CardTitle>
              <CardDescription>Assign matching healthcare professionals.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Medical Condition</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Hypertension" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="caregiverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designated Caregiver</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCaregivers.map((cg) => (
                          <SelectItem key={cg.id} value={cg.id}>
                            {cg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
                <MapPin className="h-5 w-5" />
                Security & Emergency
              </CardTitle>
              <CardDescription>Critical information for rapid response.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Residence</FormLabel>
                    <FormControl>
                      <Input placeholder="Street, District, City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verify Emergency Line</FormLabel>
                    <FormControl>
                      <div className="flex items-center relative">
                        <Phone className="absolute left-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="+84 000 000 000" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end items-center">
            <Button variant="outline" type="button" onClick={() => router.back()} className="h-11 px-8">
              Discard
            </Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white h-11 px-10 shadow-lg shadow-sky-100 dark:shadow-none transition-transform active:scale-95">
              <Save className="mr-2 h-4 w-4" />
              Finalize Profile
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
