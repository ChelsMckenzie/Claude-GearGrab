'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { verifyIdentity } from '@/actions/kyc'
import { Shield, Loader2 } from 'lucide-react'

interface VerifyButtonProps {
  userId: string
}

export function VerifyButton({ userId }: VerifyButtonProps) {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    setIsVerifying(true)

    const result = await verifyIdentity(userId)

    if (result.data?.verified) {
      router.refresh()
    }

    setIsVerifying(false)
  }

  return (
    <Button
      onClick={handleVerify}
      disabled={isVerifying}
      size="lg"
      data-testid="verify-button"
    >
      {isVerifying ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <Shield className="w-4 h-4 mr-2" />
          Verify Identity
        </>
      )}
    </Button>
  )
}
