'use client';

import { useEffect } from 'react';
import { useMedia } from './hooks/useMedia';
import { MediaUploadCard } from './components/MediaUploadCard';
import { MediaTimeline } from './components/MediaTimeline';
import { Loader2 } from 'lucide-react';
import { RoleCapabilities } from '@/modules/settings/types';

interface PatientMediaDashboardProps {
  patientId: string;
  role: string;
  capabilities: RoleCapabilities;
}

export function PatientMediaDashboard({ patientId, role, capabilities }: PatientMediaDashboardProps) {
  const { 
    mediaList, 
    isFetching, 
    isUploading, 
    uploadProgress, 
    fetchMedia, 
    uploadMedia, 
    deleteMedia 
  } = useMedia(patientId);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  if (isFetching && mediaList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p>Loading secure media assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {capabilities.canUploadMedia && (
        <MediaUploadCard 
          onUpload={(file, note) => uploadMedia(file, role, note)}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      )}
      
      <MediaTimeline 
        media={mediaList} 
        canDelete={capabilities.canUploadMedia} 
        onDelete={deleteMedia} 
      />
    </div>
  );
}
