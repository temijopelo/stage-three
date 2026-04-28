"use client";

import SplashScreen from "@/components/shared/SplashScreen";
import { getSession } from "@/lib/storage";
import { useRouter } from "next/navigation.js";
import { useEffect } from "react";
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const session = getSession();
      router.replace(session ? "/dashboard" : "/login");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
