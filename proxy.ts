import { NextRequest, NextResponse } from 'next/server';

const protectedPrefixes = [
  '/dashboard', '/transactions', '/financial-life', '/cash-flow', '/goals',
  '/loan-decision', '/what-if', '/recovery', '/insights', '/protection',
  '/governance', '/explain', '/consent', '/ask', '/profile',
  '/onboarding',
];

export function proxy(request: NextRequest) {
  const needsSession = protectedPrefixes.some(prefix => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`));
  if (needsSession && !request.cookies.has('arthdrishti_session')) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
