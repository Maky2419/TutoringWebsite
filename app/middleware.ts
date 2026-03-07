export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/book/:path*", "/dashboard/:path*", "/admin/:path*", "/student/:path*", "/tutor/:path*"],
};