import React from "react";
import logoUrl from "@/assets/images/app_logo_1790248677955.jpg";

export function AppLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl shadow-sm border border-white/10 shrink-0 select-none bg-[#091c52] ${className}`}
    >
      <img
        src={logoUrl}
        alt="Public Insight Logo"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
}
