
"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

const protectedRoutes = ["/", "/transactions", "/categories", "/report", "/settings"];
const publicRoutes = ["/login"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isProtectedRoute = protectedRoutes.includes(pathname);
      const isPublicRoute = publicRoutes.includes(pathname);

      if (isProtectedRoute && !user) {
        router.push("/login");
      }
      
      if (isPublicRoute && user) {
        router.push("/");
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
       <div className="flex h-full w-full items-center justify-center">
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>
    );
  }

  // Render children only if access is permitted
  const isProtectedRoute = protectedRoutes.includes(pathname);
  if (isProtectedRoute && !user) return null; // or a loading/denied component
  if (publicRoutes.includes(pathname) && user) return null; // or a loading spinner

  return <>{children}</>;
}
