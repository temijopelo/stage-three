"use client";
import SplashScreen from "@/components/shared/SplashScreen";
import { getSession } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // PRD §4: splash must be visible 800ms–2000ms
    const timer = setTimeout(() => {
      const session = getSession();
      router.replace(session ? "/dashboard" : "/login");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
