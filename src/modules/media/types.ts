export type PatientMedia = {
    id: string;
    patientId: string;
    url: string;
    publicId: string;
    type: 'image' | 'video';
    uploadedBy: string;
    note?: string;
    createdAt: string;
};
