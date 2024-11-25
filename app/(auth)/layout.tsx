import React, { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col md:flex-row">

    {/* Left side (children) */}
    <div className="flex-1 flex-col flex items-center justify-center">
      {children}
    </div>
  
    {/* Right side (logo) - hidden on small screens */}
    {/* <div className="hidden md:flex flex-1 bg-blue-400 items-center justify-center">
      <LogoAuth />
    </div> */}
  </div>
  );
}

export default layout;
