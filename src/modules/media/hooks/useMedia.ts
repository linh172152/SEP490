import { useState, useCallback } from 'react';
import { PatientMedia } from '../types';
import { mediaService } from '../services/media.service';
import { toast } from 'sonner';

export function useMedia(patientId: string) {
    const [mediaList, setMediaList] = useState<PatientMedia[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fetchMedia = useCallback(async () => {
        setIsFetching(true);
        try {
            const data = await mediaService.getMediaByPatient(patientId);
            setMediaList(data);
        } catch (error) {
            toast.error('Failed to load patient media');
        } finally {
            setIsFetching(false);
        }
    }, [patientId]);

    const uploadMedia = async (file: File, role: string, note?: string) => {
        setIsUploading(true);
        setUploadProgress(10);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('patientId', patientId);
            formData.append('role', role);

            setUploadProgress(40);

            // Call Next.js API Route for secure Cloudinary upload
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            setUploadProgress(70);

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            // Add to mock service store
            const newMedia: PatientMedia = {
                id: Math.random().toString(36).substring(7),
                patientId,
                url: result.secure_url,
                publicId: result.public_id,
                type: result.resource_type === 'video' ? 'video' : 'image',
                uploadedBy: role,
                note,
                createdAt: result.created_at || new Date().toISOString(),
            };

            await mediaService.addMedia(newMedia);

            setUploadProgress(100);
            setMediaList((prev) => [newMedia, ...prev]);
            toast.success('Media uploaded successfully');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error uploading file');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const deleteMedia = async (mediaId: string) => {
        try {
            // In a real app we would call an API route to delete from Cloudinary as well
            await mediaService.deleteMedia(mediaId);
            setMediaList((prev) => prev.filter((m) => m.id !== mediaId));
            toast.success('Media deleted successfully');
        } catch (error) {
            toast.error('Failed to delete media');
        }
    };

    return {
        mediaList,
        isFetching,
        isUploading,
        uploadProgress,
        fetchMedia,
        uploadMedia,
        deleteMedia
    };
}
