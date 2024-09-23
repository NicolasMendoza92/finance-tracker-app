
import LogoHome from "@/components/LogoHome";
import React, { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="h-full lg:flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 pt-1">
          <h1 className="font-bold text-2xl text-foreground ">Bienvenido</h1>
          <p className="text-base text-muted-foreground">
            Inicia sesion y explora el dashboard
          </p>
        </div>
        <div className="flex items-center justify-center mt-8">{children}</div>
      </div>
      <div className="h-full bg-blue-500 hidden lg:flex flex-col items-center justify-center">
      <LogoHome />
      </div>
    </div>
  );
}

export default layout;
