import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { AuthShell } from "@/components/features/auth/AuthShell"
import { OTPInput, useCountdown } from "@/components/features/auth/OTPInput"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/hooks/redux"
import { useVerifyEmailMutation, useResendVerificationMutation } from "@/store/api/vibeApi"
import { toast } from "sonner"

export function VerifyPage() {
  const navigate = useNavigate()
  const { pendingEmail, user } = useAppSelector((s) => s.auth)
  const savedEmail = localStorage.getItem("email")
  const email = savedEmail ?? pendingEmail ?? user?.email ?? ""

  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const { formatted, isDone, restart } = useCountdown(60)

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  // If your API has a resend endpoint, wire it here; otherwise remove this line
  // and call whatever trigger re-sends the code (e.g. re-call the register/forgot-password mutation)
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation()

  const maskedEmail = email
    ? email.replace(/^(.{2})(.+?)(@.+)$/, (_: string, a: string, _b: string, c: string) => `${a}${"*".repeat(8)}${c}`)
    : "ed*******22@yahoo.com"

  // ✅ Accept explicit `code` param so auto-submit path bypasses stale closure
  const handleVerify = useCallback(
    async (code = otp) => {
      if (code.replace(/\s/g, "").length < 6) {
        setError("Please enter all 6 digits")
        return
      }
      setError("")
      try {
        await verifyEmail({ email, code }).unwrap()
        navigate("/login", { state: { verified: true }, replace: true })
      } catch {
        setError("Invalid or expired code. Please try again.")
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [otp, email]
  )

  // ✅ Pass fresh `val` directly — don't rely on `otp` state which lags one render behind
  const handleOtpChange = (val: string) => {
    setOtp(val)
    setError("") // Clear inline errors as user retypes
    if (val.length === 6) handleVerify(val)
  }

  const handleResend = async () => {
    try {
      await resendVerification({ email }).unwrap()
      toast.success("Account Verified Successfully")
    } catch {
      setError("Failed to resend code. Please try again.")
      return
    }
    setOtp("")
    setError("")
    restart()
  }

  const isLoading = isVerifying || isResending

  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-xl font-semibold text-white">Account Verification</h1>
          <p className="text-sm text-vibe-text-muted leading-relaxed">
            Enter the 6-digit code we sent to{" "}
            <span className="text-vibe-text-secondary">{maskedEmail}</span>
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-vibe-text-muted">Enter authentication code</p>
          <OTPInput value={otp} onChange={handleOtpChange} />
          {error && <p className="text-xs text-vibe-red">{error}</p>}

          <p className="text-sm text-vibe-text-muted">
            {isDone ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-white underline underline-offset-2 font-medium disabled:opacity-50"
              >
                Resend code
              </button>
            ) : (
              <>
                Resend in{" "}
                <span className="text-white font-medium">{formatted}</span>
              </>
            )}
          </p>
        </div>

        <Button
          size="lg"
          rounded="full"
          className="w-full"
          onClick={() => (isDone ? handleResend() : handleVerify())}
          loading={isLoading}
          disabled={isLoading || (!isDone && otp.length < 6)}
        >
          {isDone ? "Resend Code" : "Verify"}
        </Button>
      </div>
    </AuthShell>
  )
}