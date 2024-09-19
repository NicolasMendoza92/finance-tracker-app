
import Logo from "@/components/Logo";
import React, { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
        <div className="mt-12">
          <Logo/>
        {children}
        </div>
      
    </div>
  );
}

export default layout;
