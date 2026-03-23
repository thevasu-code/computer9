"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const makeSessionKey = (path) => `user-view-tracked:${path}`;
const VISITOR_KEY = "site-visitor-id";

function getVisitorId() {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const generated = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  localStorage.setItem(VISITOR_KEY, generated);
  return generated;
}

function shouldTrackPath(pathname) {
  if (!pathname || !pathname.startsWith("/")) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/_next")) return false;
  return true;
}

export default function UserViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldTrackPath(pathname)) return;

    const sessionKey = makeSessionKey(pathname);
    if (sessionStorage.getItem(sessionKey) === "1") return;

    sessionStorage.setItem(sessionKey, "1");

    const visitorId = getVisitorId();

    fetch("/api/analytics/user-views", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: pathname, visitorId }),
    }).catch(() => {
      // Ignore analytics errors so storefront UX is never blocked.
    });
  }, [pathname]);

  return null;
}
