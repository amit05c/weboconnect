import { authMiddleware } from './lib/authMiddleware';

export function middleware(req) {
    return authMiddleware(req);
}

export const config = {
    matcher: '/((?!api|_next|static|favicon.ico).*)', 
};
