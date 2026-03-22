"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/account");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/account/dashboard");
      }
    } catch {
      router.replace("/account");
    }
  }, [router]);
  return (
    <div className="text-center py-12 text-lg">Redirecting to your dashboard...</div>
  );
}
