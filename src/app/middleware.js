import { NextResponse } from "next/server";

export function middleware(req) {
    console.log("Cookies received in middleware:", req.cookies); 

    const token = req.cookies.get("token")?.value; 
    console.log("Extracted Token:", token); 

    const protectedRoutes = ["/create-ride", "/my-rides", "/my-requests", "/available-rides"];

    if (protectedRoutes.includes(req.nextUrl.pathname) && !token) {
        console.log("Unauthorized access. Redirecting to login...");
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/create-ride", "/my-rides", "/my-requests", "/available-rides"],
};


