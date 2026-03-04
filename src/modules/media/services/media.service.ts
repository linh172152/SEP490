import { PatientMedia } from '../types';

class MediaService {
    private mediaStore: PatientMedia[] = [];

    async getMediaByPatient(patientId: string): Promise<PatientMedia[]> {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async delay
        return this.mediaStore
            .filter((media) => media.patientId === patientId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async addMedia(media: PatientMedia): Promise<PatientMedia> {
        await new Promise(resolve => setTimeout(resolve, 300));
        this.mediaStore.push(media);
        return media;
    }

    async deleteMedia(id: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 400));
        this.mediaStore = this.mediaStore.filter((media) => media.id !== id);
    }
}

// Export singleton instance for mock store
export const mediaService = new MediaService();
