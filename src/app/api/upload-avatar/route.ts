import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const userId = formData.get('userId') as string | null;
        const role = formData.get('role') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!userId || !role) {
            return NextResponse.json({ error: 'User ID and Role are required' }, { status: 400 });
        }

        // Role validation: only accepted roles
        const validRoles = ['doctor', 'caregiver', 'admin', 'family'];
        if (!validRoles.includes(role.toLowerCase())) {
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }

        // Validate size (< 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File size exceeds the 5MB limit' }, { status: 400 });
        }

        // Validate type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only images are allowed for avatars.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using upload_stream with overwrite targeting by public_id
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `carebot-mh/avatars/${role.toLowerCase()}`,
                    public_id: userId, // Enforces 1 avatar per userId (overwrites automatically)
                    overwrite: true,
                    resource_type: 'image',
                    transformation: [
                        { width: 512, height: 512, crop: 'fill', gravity: 'face' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
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
        });
    } catch (error: any) {
        console.error('Avatar Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload avatar. Please try again later.' }, { status: 500 });
    }
}
