import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { AuthShell } from "@/components/features/auth/AuthShell"
import { OTPInput, useCountdown } from "@/components/features/auth/OTPInput"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { setCredentials, clearPendingCredentials } from "@/store/slices/authSlice"
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLoginMutation,
  normaliseUser,
} from "@/store/api/vibeApi"
import { toast } from "sonner"

export function VerifyPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { pendingEmail, pendingCredentials, user } = useAppSelector((s) => s.auth)
  const savedEmail = localStorage.getItem("email")
  const email = savedEmail ?? pendingEmail ?? user?.email ?? ""

  const [otp, setOtp]     = useState("")
  const [error, setError] = useState("")
  const { formatted, isDone, restart } = useCountdown(60)

  const [verifyEmail, { isLoading: isVerifying }]            = useVerifyEmailMutation()
  const [resendVerification, { isLoading: isResending }]     = useResendVerificationMutation()
  const [login, { isLoading: isLoggingIn }]                  = useLoginMutation()

  const maskedEmail = email
    ? email.replace(/^(.{2})(.+?)(@.+)$/, (_: string, a: string, _b: string, c: string) => `${a}${"*".repeat(8)}${c}`)
    : "ed*******22@yahoo.com"

  /** After the OTP is accepted, silently log the user in using cached credentials */
  async function autoLogin() {
    if (!pendingCredentials) {
      // No cached credentials — redirect to login so they can sign in manually
      toast.success("Email verified! Please sign in.")
      navigate("/login", { state: { verified: true }, replace: true })
      return
    }

    try {
      const tokenRes = await login({
        email:    pendingCredentials.email,
        password: pendingCredentials.password,
      }).unwrap() as { access_token: string }

      // Fetch the user profile using the token
      const profileRes = await fetch(
        `${(import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE_URL ?? "https://vibegarage-backend.onrender.com"}/auth/me`,
        { headers: { Authorization: `Bearer ${tokenRes.access_token}` } }
      )
      const profileData = await profileRes.json()
      const userObj = normaliseUser(profileData)

      dispatch(setCredentials({ user: userObj, token: tokenRes.access_token }))
      toast.success("Welcome to Vibe Garage!")

      // Redirect based on role — normaliseUser maps to 'fan' | 'artist' | 'admin'
      const redirect = userObj.role === "artist" ? "/app/dashboard" : "/listen"
      navigate(redirect, { replace: true })
    } catch {
      // Auto-login failed — still verified, just redirect to login
      toast.success("Email verified! Please sign in.")
      navigate("/login", { state: { verified: true }, replace: true })
    } finally {
      // Always clear cached credentials regardless of outcome
      dispatch(clearPendingCredentials())
      localStorage.removeItem("email")
    }
  }

  const handleVerify = useCallback(
    async (code = otp) => {
      if (code.replace(/\s/g, "").length < 6) {
        setError("Please enter all 6 digits")
        return
      }
      setError("")
      try {
        await verifyEmail({ email, code }).unwrap()
        await autoLogin()
      } catch {
        setError("Invalid or expired code. Please try again.")
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [otp, email, pendingCredentials]
  )

  const handleOtpChange = (val: string) => {
    setOtp(val)
    setError("")
    if (val.length === 6) handleVerify(val)
  }

  const handleResend = async () => {
    try {
      await resendVerification({ email }).unwrap()
      toast.success("Verification code resent")
    } catch {
      setError("Failed to resend code. Please try again.")
      return
    }
    setOtp("")
    setError("")
    restart()
  }

  const isLoading = isVerifying || isResending || isLoggingIn

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
          {isLoggingIn ? "Signing you in…" : isDone ? "Resend Code" : "Verify"}
        </Button>
      </div>
    </AuthShell>
  )
}
