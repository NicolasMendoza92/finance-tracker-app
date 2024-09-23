
import Image from "next/image";
import React from "react";

function LogoHome() {
  return (
    <a href="/" className="items-center justify-center gap-2 p-1">
       <p className="bg-foreground text-center bg-clip-text text-2xl font-bold leading-tight tracking-tighter text-transparent">
        Entiende tus finanzas
      </p>
      <Image src="/logo.png" height={300} width={300} alt="Entiende tus finanzas"/>
    </a>
  );
}


export default LogoHome;