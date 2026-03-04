import { useState } from 'react';
import { toast } from 'sonner';

interface UseAvatarUploadProps {
    userId: string;
    role: string;
    onSuccess?: (url: string) => void;
}

export function useAvatarUpload({ userId, role, onSuccess }: UseAvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadAvatar = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(10);

        try {
            if (file.size > 5 * 1024 * 1024) throw new Error('File exceeds 5MB limit');
            if (!file.type.startsWith('image/')) throw new Error('Only image files are supported');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);
            formData.append('role', role);

            setUploadProgress(40);

            const response = await fetch('/api/upload-avatar', {
                method: 'POST',
                body: formData,
            });

            setUploadProgress(70);

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Avatar upload failed');
            }

            setUploadProgress(100);
            toast.success('Profile avatar updated successfully');

            if (onSuccess) {
                // Return Cloudinary optimized 128x128 face crop
                const optimizedUrl = result.secure_url.replace('/upload/', '/upload/w_128,h_128,c_fill,g_face,q_auto,f_auto/');
                onSuccess(optimizedUrl);
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error uploading avatar');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const deleteAvatar = async (publicId: string) => {
        setIsUploading(true);
        setUploadProgress(50);
        try {
            if (!publicId) throw new Error('No avatar to delete');

            const response = await fetch('/api/delete-avatar', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': role,
                },
                body: JSON.stringify({ publicId, userId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Avatar deletion failed');
            }

            setUploadProgress(100);
            toast.success('Avatar removed successfully');

            if (onSuccess) {
                onSuccess('');
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error deleting avatar');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return {
        uploadAvatar,
        deleteAvatar,
        isUploading,
        uploadProgress,
    };
}
