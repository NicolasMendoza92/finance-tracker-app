import { ClerkLoaded, ClerkLoading, SignUp } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

export default function Page() {
  return (
    <>
     <ClerkLoaded>
        <SignUp />
      </ClerkLoaded>
      <ClerkLoading>
        <Loader2 className="animated-spin text-muted-foreground" />
      </ClerkLoading>
    </>
  )
}