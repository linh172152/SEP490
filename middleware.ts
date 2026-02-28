import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Read token and role from cookies
    const token = request.cookies.get('accessToken')?.value;
    const role = request.cookies.get('userRole')?.value;

    // Protect all routes under /dashboard/*
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const path = request.nextUrl.pathname;

        // Validate role-based access
        if (path.startsWith('/dashboard/admin') && role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        if (path.startsWith('/dashboard/doctor') && role !== 'DOCTOR') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        if (path.startsWith('/dashboard/caregiver') && role !== 'CAREGIVER') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        if (path.startsWith('/dashboard/family') && role !== 'FAMILY') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
