import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const patientId = formData.get('patientId') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
        }

        // Role validation simulated: in a real app, this should check the user's secure token
        const role = formData.get('role') as string | null;
        if (role !== 'CAREGIVER') {
            return NextResponse.json({ error: 'Unauthorized: Only caregivers can upload media' }, { status: 403 });
        }

        // Validate size (< 10MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File size exceeds the 10MB limit' }, { status: 400 });
        }

        // Validate type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only images and videos are allowed.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using upload_stream
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `carebot-mh/patients/${patientId}`,
                    resource_type: 'auto', // Handles both images and videos
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            const { Readable } = require('stream');
            const readable = new Readable({
                read() {
                    this.push(buffer);
                    this.push(null);
                }
            });
            readable.pipe(uploadStream);
        });

        const uploadResult = result as any;

        return NextResponse.json({
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            resource_type: uploadResult.resource_type,
            created_at: uploadResult.created_at,
        });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload media. Please try again later.' }, { status: 500 });
    }
}
