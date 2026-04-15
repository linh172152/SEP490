'use client';

import { ElderlyDetailView } from '@/components/dashboard/ElderlyDetailView';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { elderlyService } from '@/services/api/elderlyService';
import { roomService } from '@/services/api/roomService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { userPackageService } from '@/services/api/userPackageService';
import type { ElderlyProfileResponse, ServicePackageResponse, UserPackageResponse } from '@/services/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Globe, Loader2, MapPin, Package } from 'lucide-react';

export default function FamilyElderlyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const elderlyId = Number(id);
  const [profile, setProfile] = useState<ElderlyProfileResponse | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [ownedPackages, setOwnedPackages] = useState<UserPackageResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!Number.isFinite(elderlyId)) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const detail = await elderlyService.getById(elderlyId);
        setProfile(detail);

        const [packages, userPackages] = await Promise.all([
          servicePackageService.getAll().catch(() => [] as ServicePackageResponse[]),
          userPackageService.getByAccountId(detail.accountId).catch(async () => {
            const all = await userPackageService.getAll().catch(() => [] as UserPackageResponse[]);
            return all.filter((item) => item.accountId === detail.accountId);
          }),
        ]);

        setServicePackages(packages);
        setOwnedPackages(userPackages);

        if (detail.roomId) {
          const room = await roomService.getRoomById(detail.roomId).catch(() => null);
          setRoomName(room?.roomName || `Room ${detail.roomId}`);
        } else {
          setRoomName(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [elderlyId]);

  const activeOwnedPackages = useMemo(() => {
    const now = Date.now();
    return ownedPackages.filter((item) => {
      const expiry = Date.parse(item.expiredAt);
      return Number.isNaN(expiry) || expiry >= now;
    });
  }, [ownedPackages]);

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Summary</CardTitle>
            <CardDescription>Thong tin co ban cua elderly profile theo ID.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Dang tai profile...
              </div>
            ) : !profile ? (
              <p className="text-sm text-muted-foreground">Khong tim thay elderly profile.</p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="font-semibold text-lg">{profile.name}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> {new Date(profile.dateOfBirth).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" /> {profile.preferredLanguage}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {roomName || 'Chua co phong'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owned Package</CardTitle>
            <CardDescription>Trang thai goi da mua cua account gan voi elderly profile nay.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Dang tai package...
              </div>
            ) : activeOwnedPackages.length === 0 ? (
              <Badge variant="secondary">Chua mua goi</Badge>
            ) : (
              activeOwnedPackages.map((item) => {
                const matchedPackage = servicePackages.find((pkg) => pkg.id === item.servicePackageId);
                return (
                  <div key={item.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{matchedPackage?.name || `Package #${item.servicePackageId}`}</span>
                      <Badge variant="outline">{matchedPackage?.level || 'Unknown level'}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Assigned: {new Date(item.assignedAt).toLocaleDateString()} | Expired: {new Date(item.expiredAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Service Packages</CardTitle>
            <CardDescription>Danh sach goi lay tu GET /api/service-packages de so sanh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Dang tai service packages...
              </div>
            ) : servicePackages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chua co du lieu service package.</p>
            ) : (
              servicePackages.map((pkg) => {
                const isOwned = activeOwnedPackages.some((item) => item.servicePackageId === pkg.id);
                return (
                  <div key={pkg.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{pkg.name}</span>
                      <Badge variant={isOwned ? 'default' : 'secondary'}>
                        {isOwned ? 'Da mua' : 'Chua mua'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <Package className="mr-1 inline h-3 w-3" />
                      {pkg.level} | {pkg.price.toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <ElderlyDetailView elderlyId={id} role="FAMILY" />
    </div>
  );
}
