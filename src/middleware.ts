import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login", // Redirect unauthorized users here
  },
});

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/settings/:path*"], // Paths to protect
};
