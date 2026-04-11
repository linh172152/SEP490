'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { roomService } from '@/services/api/roomService';
import { elderlyService } from '@/services/api/elderlyService';
import { caregiverService } from '@/services/api/caregiverService';
import { Room, ElderlyProfileResponse, AccountResponse } from '@/services/api/types';
import { UserPlus, Users, ArrowLeft, UserMinus } from 'lucide-react';
import Link from 'next/link';

export default function ManagerRoomDetailPage() {
  const params = useParams();
  const roomId = parseInt(params.id as string);

  const [room, setRoom] = useState<Room | null>(null);
  const [elderlyInRoom, setElderlyInRoom] = useState<ElderlyProfileResponse[]>([]);
  const [caregiversInRoom, setCaregiversInRoom] = useState<AccountResponse[]>([]);
  const [availableElderly, setAvailableElderly] = useState<ElderlyProfileResponse[]>([]);
  const [availableCaregivers, setAvailableCaregivers] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignElderlyDialogOpen, setIsAssignElderlyDialogOpen] = useState(false);
  const [isAssignCaregiverDialogOpen, setIsAssignCaregiverDialogOpen] = useState(false);
  const [selectedElderly, setSelectedElderly] = useState<number[]>([]);
  const [selectedCaregivers, setSelectedCaregivers] = useState<number[]>([]);

  const loadRoomData = useCallback(async () => {
    try {
      const [roomData, allElderly, allCaregivers] = await Promise.all([
        roomService.getById(roomId),
        elderlyService.getAll(),
        caregiverService.getAllWithRooms()
      ]);

      setRoom(roomData);
      setElderlyInRoom(allElderly.filter(e => e.roomId === roomId));
      setCaregiversInRoom(allCaregivers.filter(c => c.roomId === roomId));
      setAvailableElderly(allElderly.filter(e => !e.roomId));
      setAvailableCaregivers(allCaregivers.filter(c => !c.roomId));
    } catch (error) {
      console.error('Failed to load room data:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoomData();
  }, [loadRoomData]);

  const handleAssignElderly = async () => {
    try {
      for (const elderlyId of selectedElderly) {
        await elderlyService.assignToRoom(elderlyId, roomId);
      }
      setIsAssignElderlyDialogOpen(false);
      setSelectedElderly([]);
      loadRoomData();
    } catch (error) {
      console.error('Failed to assign elderly:', error);
    }
  };

  const handleAssignCaregivers = async () => {
    try {
      for (const caregiverId of selectedCaregivers) {
        await caregiverService.assignToRoom(caregiverId, roomId);
      }
      setIsAssignCaregiverDialogOpen(false);
      setSelectedCaregivers([]);
      loadRoomData();
    } catch (error) {
      console.error('Failed to assign caregivers:', error);
    }
  };

  const handleUnassignElderly = async (elderlyId: number) => {
    try {
      await elderlyService.assignToRoom(elderlyId, null);
      loadRoomData();
    } catch (error) {
      console.error('Failed to unassign elderly:', error);
    }
  };

  const handleUnassignCaregiver = async (caregiverId: number) => {
    try {
      await caregiverService.assignToRoom(caregiverId, null);
      loadRoomData();
    } catch (error) {
      console.error('Failed to unassign caregiver:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading room details...</div>;
  }

  if (!room) {
    return <div className="p-6">Room not found</div>;
  }

  const roomLabel = room.roomName ?? room.name ?? 'Room';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/manager/rooms">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rooms
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{roomLabel} - Room Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room.capacity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elderly Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elderlyInRoom.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caregiver</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {caregiversInRoom.length > 0 ? caregiversInRoom[0].fullName : 'Unassigned'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="elderly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="elderly">Elderly Assignment ({elderlyInRoom.length}/{room.capacity ?? 0})</TabsTrigger>
          <TabsTrigger value="caregivers">Caregiver Assignment ({caregiversInRoom.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="elderly" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Elderly in {roomLabel}</h2>
            <Dialog open={isAssignElderlyDialogOpen} onOpenChange={setIsAssignElderlyDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={elderlyInRoom.length >= (room.capacity ?? 0)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Elderly
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign Elderly to {roomLabel}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto">
                    {availableElderly.map((elderly) => (
                      <div key={elderly.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          id={`elderly-${elderly.id}`}
                          checked={selectedElderly.includes(elderly.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedElderly([...selectedElderly, elderly.id]);
                            } else {
                              setSelectedElderly(selectedElderly.filter(id => id !== elderly.id));
                            }
                          }}
                        />
                        <label htmlFor={`elderly-${elderly.id}`} className="flex-1">
                          {elderly.name} (Age: {new Date().getFullYear() - new Date(elderly.dateOfBirth).getFullYear()})
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleAssignElderly} disabled={selectedElderly.length === 0}>
                    Assign Selected ({selectedElderly.length})
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Health Status</TableHead>
                    <TableHead>Package Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elderlyInRoom.map((elderly) => (
                    <TableRow key={elderly.id}>
                      <TableCell className="font-medium">{elderly.name}</TableCell>
                      <TableCell>{new Date().getFullYear() - new Date(elderly.dateOfBirth).getFullYear()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{elderly.healthNotes ? 'Has Notes' : 'Good'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Check Package</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassignElderly(elderly.id)}
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unassign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caregivers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Caregivers in {roomLabel}</h2>
            <Dialog open={isAssignCaregiverDialogOpen} onOpenChange={setIsAssignCaregiverDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={caregiversInRoom.length > 0}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Caregiver
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign Caregiver to {roomLabel}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto">
                    {availableCaregivers.map((caregiver) => (
                      <div key={caregiver.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          id={`caregiver-${caregiver.id}`}
                          checked={selectedCaregivers.includes(caregiver.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCaregivers([...selectedCaregivers, caregiver.id]);
                            } else {
                              setSelectedCaregivers(selectedCaregivers.filter(id => id !== caregiver.id));
                            }
                          }}
                        />
                        <label htmlFor={`caregiver-${caregiver.id}`} className="flex-1">
                          {caregiver.fullName} ({caregiver.email})
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleAssignCaregivers} disabled={selectedCaregivers.length === 0}>
                    Assign Selected ({selectedCaregivers.length})
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {caregiversInRoom.map((caregiver) => (
                    <TableRow key={caregiver.id}>
                      <TableCell className="font-medium">{caregiver.fullName}</TableCell>
                      <TableCell>{caregiver.email}</TableCell>
                      <TableCell>
                        <Badge variant="default">{caregiver.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassignCaregiver(caregiver.id)}
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unassign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}