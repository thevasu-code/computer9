"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const makeSessionKey = (path) => `admin-view-tracked:${path}`;

export default function AdminViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname?.startsWith("/admin")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const sessionKey = makeSessionKey(pathname);
    if (sessionStorage.getItem(sessionKey) === "1") return;

    sessionStorage.setItem(sessionKey, "1");

    fetch("/api/analytics/admin-views", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {
      // Ignore analytics errors so admin UX is never blocked.
    });
  }, [pathname]);

  return null;
}
