'use client';

import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, UploadCloud, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarUploadProps {
  userId: string;
  role: string;
  currentAvatar?: string;
  nameFallback?: string;
  onAvatarUpdated: (url: string) => void;
}

export function AvatarUpload({ userId, role, currentAvatar, nameFallback = 'U', onAvatarUpdated }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleSuccess = (optimizedUrl: string) => {
    setPreview(optimizedUrl);
    onAvatarUpdated(optimizedUrl);
  };

  const { uploadAvatar, isUploading, uploadProgress } = useAvatarUpload({
    userId,
    role,
    onSuccess: handleSuccess,
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        alert('Invalid file format or size exceeds 5MB limit.');
        return;
      }
      
      const file = acceptedFiles[0];
      if (file) {
        // Create a temporary client-side preview immediately for responsiveness
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        
        // Start upload
        await uploadAvatar(file);
      }
    },
    [uploadAvatar]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB limit
    multiple: false,
    disabled: isUploading
  });

  const displayAvatar = preview || currentAvatar;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm animate-in fade-in duration-500">
      
      <div {...getRootProps()} className="relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-full">
        <input {...getInputProps()} />
        
        {/* Avatar Display */}
        <Avatar className={`h-28 w-28 border-4 ring-offset-2 ring-2 shadow-md transition-all duration-300 ${isDragActive ? 'border-sky-400 ring-sky-300 scale-105' : 'border-white dark:border-slate-950 ring-slate-100 dark:ring-slate-800'}`}>
          <AvatarImage src={displayAvatar} className="object-cover" />
          <AvatarFallback className="text-3xl font-bold bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
            {nameFallback.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Hover Overlay */}
        <div className={`absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center text-white transition-opacity duration-300 ${isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${isUploading ? 'hidden' : ''}`}>
          <Camera className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{displayAvatar ? 'Change' : 'Upload'}</span>
        </div>

        {/* Loading Spinner */}
        <AnimatePresence>
          {isUploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border-4 border-sky-400"
            >
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 space-y-3 text-center sm:text-left">
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Profile Picture</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click or drag an image onto the avatar. JPG, PNG, WEBP. Max 5MB.
          </p>
        </div>

        {isUploading ? (
          <div className="space-y-1.5 max-w-[200px] mx-auto sm:mx-0">
            <div className="flex justify-between text-[10px] font-medium text-sky-600 dark:text-sky-400">
              <span className="uppercase tracking-wider">Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1.5" />
          </div>
        ) : (
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Button 
              type="button"
              variant="secondary" 
              size="sm" 
              className="text-xs h-8"
              onClick={() => {
                 const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                 if(input) input.click();
              }}
            >
              <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
              Upload New
            </Button>
            
            {displayAvatar && (
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  onAvatarUpdated(''); // Tell parent form the avatar is cleared
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Remove
              </Button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
