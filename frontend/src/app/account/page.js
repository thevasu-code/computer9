"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/account/dashboard');
    } else {
      router.replace('/account/login');
    }
  }, [router]);
  return null;
}
