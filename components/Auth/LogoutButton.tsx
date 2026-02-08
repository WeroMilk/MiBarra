"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, useFirebase } from "@/lib/firebase";
import { demoAuth } from "@/lib/demoAuth";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

export default function LogoutButton({ className = "", showText = true }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    if (useFirebase && auth) {
      await signOut(auth);
    } else {
      demoAuth.signOut();
    }
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-1.5 min-[380px]:gap-2 px-3 min-[380px]:px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 transition-all rounded-xl border border-red-600 flex-shrink-0 touch-manipulation min-h-[44px] min-[380px]:min-h-0 ${className}`}
      aria-label="Salir"
    >
      <LogOut className="w-4 h-4 shrink-0" />
      {showText && <span className="text-xs min-[380px]:text-sm font-medium hidden min-[380px]:inline">Salir</span>}
    </button>
  );
}
