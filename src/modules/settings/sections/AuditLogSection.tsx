'use client';

import { RoleCapabilities, AuditLogEntry } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ShieldX, Search, Download, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AuditLogSectionProps {
  capabilities: RoleCapabilities;
  auditLogs: AuditLogEntry[];
}

export function AuditLogSection({ capabilities, auditLogs }: AuditLogSectionProps) {
  const [search, setSearch] = useState('');

  if (!capabilities.canAccessAuditLogs) {
    return (
      <Card className="border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 border-dashed">
        <CardContent className="pt-6 pb-6 text-center">
          <ShieldX className="h-8 w-8 text-rose-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">Access Restricted</h3>
          <p className="text-sm text-rose-700 dark:text-rose-300 mt-2 max-w-md mx-auto">
            Viewing the system audit trail requires specialized compliance permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredLogs = auditLogs.filter(log => 
    log.userName.toLowerCase().includes(search.toLowerCase()) || 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium line-through decoration-destructive/50 opacity-60 italic">System Audit Logs</h3>
          <p className="text-sm text-muted-foreground">Immutable record of system access and configuration changes.</p>
        </div>
        <Button variant="outline" className="shrink-0 bg-white dark:bg-slate-950">
           <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
           <div className="relative max-w-sm flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input 
                 placeholder="Search by user, action, or module..." 
                 className="pl-9"
                 value={search}
                 onChange={e => setSearch(e.target.value)}
              />
           </div>
        </CardHeader>
        <CardContent>
           <div className="rounded-md border overflow-hidden">
               <Table>
                   <TableHeader className="bg-slate-50 dark:bg-slate-900">
                       <TableRow>
                           <TableHead>Timestamp</TableHead>
                           <TableHead>User / Role</TableHead>
                           <TableHead>Action</TableHead>
                           <TableHead>Module</TableHead>
                           <TableHead className="text-right">Status</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       {filteredLogs.map(log => (
                          <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 font-mono">
                                     <Clock className="h-3 w-3" />
                                     {new Date(log.timestamp).toLocaleString()}
                                  </div>
                              </TableCell>
                              <TableCell className="font-medium whitespace-nowrap">
                                 {log.userName}
                                 <span className="block text-xs font-normal text-muted-foreground italic">IP: {log.ipAddress}</span>
                              </TableCell>
                              <TableCell className="text-sm truncate max-w-[200px]">{log.action}</TableCell>
                              <TableCell>
                                 <Badge variant="secondary" className="bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 font-normal">
                                     {log.module}
                                 </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                  <Badge 
                                     variant="outline" 
                                     className={log.status === 'success' 
                                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800' 
                                        : 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800'}
                                  >
                                      {log.status.toUpperCase()}
                                  </Badge>
                              </TableCell>
                          </TableRow>
                       ))}
                       {filteredLogs.length === 0 && (
                          <TableRow>
                              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                  No audit logs found matching your search.
                              </TableCell>
                          </TableRow>
                       )}
                   </TableBody>
               </Table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
