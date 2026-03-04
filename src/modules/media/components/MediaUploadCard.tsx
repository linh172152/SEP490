'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UploadCloud, FileBadge, X, Image as ImageIcon, Film } from 'lucide-react';

interface MediaUploadCardProps {
  onUpload: (file: File, note: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

export function MediaUploadCard({ onUpload, isUploading, uploadProgress }: MediaUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    // Validate size (< 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File exceeds 10MB limit');
      return;
    }
    
    // Validate type
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      alert('Only images and videos are allowed');
      return;
    }

    setFile(selectedFile);
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setNote('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file) return;
    await onUpload(file, note);
    handleClear();
  };

  return (
    <Card className="border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-sky-500" />
          Upload Patient Media
        </CardTitle>
        <CardDescription>
          Securely upload images or videos to the patient's record (Max 10MB).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <div 
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-700 hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-3">
              <UploadCloud className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">Click or drag file to upload</p>
            <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WEBP, MP4, WEBM</p>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*,video/*"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {file.type.startsWith('video/') ? (
                    <Film className="h-8 w-8 text-slate-400" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-400" />
                  )}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!isUploading && (
                <Button variant="ghost" size="icon" onClick={handleClear} className="text-slate-400 hover:text-rose-500">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Clinical Note (Optional)</label>
              <textarea 
                className="w-full min-h-[80px] p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none disabled:opacity-50"
                placeholder="Enter context or observations regarding this media..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isUploading}
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Uploading securely...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        )}
      </CardContent>
      {file && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClear} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isUploading} className="bg-sky-600 hover:bg-sky-700">
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
