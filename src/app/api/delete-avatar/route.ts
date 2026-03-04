import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { publicId, userId } = body;

        if (!publicId || !userId) {
            return NextResponse.json({ error: 'Public ID and User ID are required' }, { status: 400 });
        }

        // Role validation simulated: in a real app, you would check session token here
        const roleHeader = req.headers.get('x-user-role');
        const validRoles = ['doctor', 'caregiver', 'admin', 'family'];
        if (!roleHeader || !validRoles.includes(roleHeader.toLowerCase())) {
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }

        // Ownership validation check: Only allow deleting if publicId matches the requesting userId
        // Note: since our naming convention enforces public_id as carebot-mh/avatars/{role}/{userId}
        // we extract the base ID
        const extractedId = publicId.split('/').pop();
        if (extractedId !== userId) {
            return NextResponse.json({ error: 'Forbidden: You cannot delete another user\'s avatar' }, { status: 403 });
        }

        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok' && result.result !== 'not found') {
            console.error('Cloudinary deletion failed:', result);
            return NextResponse.json({ error: 'Failed to delete avatar from storage' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Avatar deleted successfully' });
    } catch (error: any) {
        console.error('Avatar Deletion Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
