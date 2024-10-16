import { LogoAuth } from "@/components/Logo";
import Image from "next/image";
import React, { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col md:flex-row">

    {/* Left side (children) */}
    <div className="flex-1 flex-col flex items-center justify-center">
    <Image width={50} height={50} alt='logo' className="md:hidden" src={"/logo-entiende-tus-finanzas.png"}/>
    <p className="bg-blue-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent md:hidden">Entiende tus Finanzas</p>
      {children}
    </div>
  
    {/* Right side (logo) - hidden on small screens */}
    <div className="hidden md:flex flex-1 bg-blue-400 items-center justify-center">
      <LogoAuth />
    </div>
  </div>
  );
}

export default layout;
