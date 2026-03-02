'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { User, Bell, Monitor, Save, Shield, Users } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import { fakeUsers } from '@/services/fakeUsers';

const settingsFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  emailAlerts: z.boolean().default(true),
  smsAlerts: z.boolean().default(false),
  criticalOnly: z.boolean().default(false),
  darkMode: z.boolean().default(false),
  role: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function CaregiverSettingsPage() {
  const { setTheme } = useTheme();
  const { user, login } = useAuthStore();
  
  const form = useForm({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      fullName: user?.name || 'Maria Rodriguez',
      email: user?.email || 'caregiver@carebot.com',
      emailAlerts: true,
      smsAlerts: false,
      criticalOnly: false,
      darkMode: false,
      role: user?.role || 'CAREGIVER',
    },
  });

  // Update form when user changes (e.g. after profile switch)
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.name,
        email: user.email,
        emailAlerts: true,
        smsAlerts: false,
        criticalOnly: false,
        darkMode: false,
        role: user.role,
      });
    }
  }, [user, form]);

  const otherCaregivers = fakeUsers.filter(u => u.role === 'CAREGIVER' && u.id !== user?.id);

  function onSubmit(data: SettingsFormValues) {
    setTheme(data.darkMode ? 'dark' : 'light');
    toast.success('Settings updated successfully', {
      description: 'Your profile and preferences have been saved.',
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-100 dark:border-sky-900/30 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and notification settings.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-sky-700 dark:text-sky-400 flex items-center gap-1">
            <Users className="h-4 w-4" />
            Switch (Demo):
          </span>
          <Select onValueChange={(email) => login(email, 'password123')}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-slate-950 border-sky-200 dark:border-sky-800">
              <SelectValue placeholder="Other Caregivers" />
            </SelectTrigger>
            <SelectContent>
              {otherCaregivers.map((cg) => (
                <SelectItem key={cg.id} value={cg.email || ''}>
                  {cg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Section */}
            <Card className="border-none shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-sky-500" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal details and contact information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input disabled {...field} />
                        </FormControl>
                        <FormDescription>Your role is assigned by the administrator.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-sky-500" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure how you receive updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="emailAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email alerts</FormLabel>
                        <FormDescription>
                          Receive notifications via email.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smsAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SMS alerts</FormLabel>
                        <FormDescription>
                          Receive notifications via text message.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="criticalOnly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Critical only</FormLabel>
                        <FormDescription>
                          Only notify me for high-priority alerts.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-sky-500" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the interface of your dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="darkMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Dark Mode</FormLabel>
                        <FormDescription>
                          Toggle between light and dark themes (mock).
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm px-8">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
