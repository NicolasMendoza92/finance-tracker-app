
import { Wallet } from 'lucide-react'
import React from 'react'

function Logo() {
  return (
    <a href='/' className='flex items-center gap-2'>
        <Wallet/>
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
      <Wallet/>
        <p className='bg-blue-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent'>
        Flujo de finanzas 
        </p>
    </a>
  )
}

export default Logo