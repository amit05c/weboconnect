import { NextResponse } from 'next/server';

const unprotectedRoutes = ['/auth/login', '/auth/register'];

export function authMiddleware(req) {
    const token = req.cookies.get('token'); 
    const url = req.nextUrl;

    if (unprotectedRoutes.includes(url.pathname)) {
        return NextResponse.next();
    }

    // Handle the '/' route specifically
    if (url.pathname === '/') {
        if (token) {
            // If authenticated, redirect to /feed
            return NextResponse.redirect(new URL('/feed', req.url));
        } else {
            // If not authenticated, redirect to /auth/login
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }
    }

   
    if (token) {
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/auth/login', req.url));
}
