
import Image from 'next/image'
import React from 'react'

function Logo() {
  return (
    <a href='/' className='flex items-center gap-2'>
        <Image width={50} height={50} alt='logo' src={"/LOGO_SM_ROJO.png"}/>
        <p className='bg-blue-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent'>
            Flujo de finanzas 
        </p>
    </a>
  )
}

export function LogoMobile() {
  return (
    <a href='/' className='flex items-center gap-2'>
        <p className='bg-blue-500 bg-clip-text text-xl font-bold leading-tight tracking-tighter text-transparent'>
        Flujo de finanzas 
        </p>
    </a>
  )
}

export function LogoAuth() {
  return (
    <a href='/' className='flex flex-col items-center gap-2'>
      <Image width={300} height={300} alt='logo' src={"/LOGO_SM_ROJO.png"}/>
        <p className='bg-blue-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent'>
        Flujo de finanzas 
        </p>
    </a>
  )
}

export default Logo