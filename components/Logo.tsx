
import Image from "next/image";
import React from "react";

function Logo() {
  return (
    <a href="/" className="items-center justify-center gap-2 p-1">
      <Image src="/logo.png" height={70} width={70} alt="Entiende tus finanzas"/>
    </a>
  );
}

export function LogoMobile() {
  return (
    <a href="/" className="items-center gap-2">
       <Image src="/logo.png" height={35} width={35} alt="Entiende tus finanzas"/>
    </a>
  );
}

export default Logo;
