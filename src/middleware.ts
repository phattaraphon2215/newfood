import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // ตรวจสอบว่ามี Session Cookie ของการล็อกอินหรือไม่ (Workshop 6: Protected Routes)
  const sessionToken = request.cookies.get("auth-token")?.value;

  // ถ้าพยายามเข้าหน้า /dashboard หรือ /profile แต่ไม่มี Token ให้ Redirect ไปที่ /login ทันที
  if (
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/profile")) &&
    !sessionToken
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// กำหนดหน้าที่ต้องการให้ Middleware เฝ้าตรวจ ("รปภ. ประจำประตู")
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
