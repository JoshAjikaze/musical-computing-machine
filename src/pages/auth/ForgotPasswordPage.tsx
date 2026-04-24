import { useReducer, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, Lock, Eye, EyeOff, X, Info } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { AuthShell } from "@/components/features/auth/AuthShell"
import { OTPInput, useCountdown } from "@/components/features/auth/OTPInput"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form"
import {
  useForgotPasswordMutation,
  useVerifyEmailMutation,
  useResetPasswordMutation,
} from "@/store/api/vibeApi"

// ── Wizard ────────────────────────────────────────────────
type ResetStep = 1 | 2 | 3

interface ResetState { step: ResetStep; email: string; resetToken: string }
type ResetAction =
  | { type: "SEND_OTP"; email: string }
  | { type: "OTP_VERIFIED"; token: string }
  | { type: "BACK" }

function reducer(state: ResetState, action: ResetAction): ResetState {
  switch (action.type) {
    case "SEND_OTP":    return { step: 2, email: action.email, resetToken: state.resetToken }
    case "OTP_VERIFIED":return { ...state, step: 3, resetToken: action.token }
    case "BACK":        return { ...state, step: (state.step - 1) as ResetStep }
    default:            return state
  }
}

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit:    { opacity: 0, x: -24, transition: { duration: 0.2 } },
}

export function ForgotPasswordPage() {
  const [state, dispatch] = useReducer(reducer, { step: 1, email: "", resetToken: "" })

  return (
    <AuthShell showBack={state.step > 1} onBack={() => dispatch({ type: "BACK" })}>
      <AnimatePresence mode="wait">
        {state.step === 1 && (
          <motion.div key="step1" {...slide}>
            <ResetStep1 onNext={(email) => dispatch({ type: "SEND_OTP", email })} />
          </motion.div>
        )}
        {state.step === 2 && (
          <motion.div key="step2" {...slide}>
            <ResetStep2
              email={state.email}
              onVerified={(token) => dispatch({ type: "OTP_VERIFIED", token })}
            />
          </motion.div>
        )}
        {state.step === 3 && (
          <motion.div key="step3" {...slide}>
            <ResetStep3 resetToken={state.resetToken} />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}

// ── Step 1 — Enter email ──────────────────────────────────
const step1Schema = z.object({
  email: z.string().email("Enter a valid email address"),
})

function ResetStep1({ onNext }: { onNext: (email: string) => void }) {
  const [callForgotPw, { isLoading }] = useForgotPasswordMutation()
  const form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: "" },
  })

  const handleSubmit = async (v: z.infer<typeof step1Schema>) => {
    try {
      await callForgotPw({ email: v.email }).unwrap()
      onNext(v.email)
    } catch {
      form.setError("email", { message: "Email not found. Please try again." })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-semibold text-white">Password Reset</h1>
          <p className="text-sm text-vibe-text-muted leading-relaxed">
            Please provide your email address, so we can send an OTP to that effect.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  icon={<Mail className="h-4 w-4" />}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" rounded="full" className="w-full" loading={isLoading}>
          Send OTP
        </Button>
      </form>
    </Form>
  )
}

// ── Step 2 — OTP + verification success banner ────────────
function ResetStep2({ email, onVerified }: { email: string; onVerified: (token: string) => void }) {
  const [otp, setOtp] = useState("")
  const [verified, setVerified] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [error, setError] = useState("")
  const { formatted, isDone, restart } = useCountdown(60)
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation()
  const [resendOtp] = useForgotPasswordMutation()

  const maskedEmail = email.replace(/^(.{2})(.+?)(@.+)$/, (_, a, _b, c) => `${a}${"*".repeat(8)}${c}`)

  const handleOtpChange = async (val: string) => {
    setOtp(val)
    if (val.length === 4 && !verified) {
      setError("")
      try {
        const res = await verifyEmail({ email, code: val }).unwrap()
        const token = (res as Record<string, string> | null)?.token ?? val
        setVerified(true)
        setShowBanner(true)
        setTimeout(() => onVerified(token), 1400)
      } catch {
        setError("Invalid code. Please try again.")
        setOtp("")
      }
    }
  }

  const handleResend = async () => {
    setOtp("")
    setVerified(false)
    setShowBanner(false)
    setError("")
    restart()
    try { await resendOtp({ email }).unwrap() } catch { /* best effort */ }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold text-white">Password Reset</h1>
        <p className="text-sm text-vibe-text-muted leading-relaxed">
          Enter the 4-digit code we have sent via the email address{" "}
          <span className="text-vibe-text-secondary">{maskedEmail}</span>
        </p>
      </div>

      {/* Success banner — shown when code verified (Password_reset_II design) */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-md bg-green-500/20 border border-green-500/40"
          >
            <Info className="h-4 w-4 text-green-400 shrink-0" />
            <span className="text-sm text-green-400 flex-1">Verification successful.</span>
            <button onClick={() => setShowBanner(false)} className="text-green-400 hover:text-green-300">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <p className="text-sm text-vibe-text-muted">Enter authentication code</p>
        <OTPInput value={otp} onChange={handleOtpChange} verified={verified} />
        {error && <p className="text-xs text-vibe-red">{error}</p>}
        <p className="text-sm text-vibe-text-muted">
          Resend in{" "}
          <span className="text-white underline underline-offset-2 font-medium">{formatted}</span>
        </p>
      </div>

      <Button
        size="lg"
        rounded="full"
        className="w-full"
        onClick={isDone ? handleResend : undefined}
        disabled={!isDone || verified}
        loading={isLoading}
      >
        Resend
      </Button>
    </div>
  )
}

// ── Step 3 — New password ─────────────────────────────────
const step3Schema = z.object({
  password: z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Password must be same as above.",
  path: ["confirmPassword"],
})

function ResetStep3({ resetToken }: { resetToken: string }) {
  const navigate = useNavigate()
  const [showPass, setShowPass]         = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [resetPassword, { isLoading }]  = useResetPasswordMutation()

  const form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const onSubmit = async (values: z.infer<typeof step3Schema>) => {
    try {
      await resetPassword({ token: resetToken, new_password: values.password }).unwrap()
      navigate("/login", { state: { passwordReset: true } })
    } catch {
      form.setError("password", { message: "Failed to reset password. Please try again." })
    }
  }

  const ToggleIcon = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} className="text-vibe-text-muted hover:text-white transition-colors">
      {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-semibold text-white">Change Password</h1>
          <p className="text-sm text-vibe-text-muted">Securely change your password,</p>
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  suffix={<ToggleIcon show={showPass} toggle={() => setShowPass((v) => !v)} />}
                  {...field}
                />
              </FormControl>
              <FormDescription>Must be at least 8 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retype Password</FormLabel>
              <FormControl>
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  suffix={<ToggleIcon show={showConfirm} toggle={() => setShowConfirm((v) => !v)} />}
                  {...field}
                />
              </FormControl>
              <FormDescription>Password must be same as above.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" rounded="full" className="w-full" loading={isLoading}>
          Change password
        </Button>
      </form>
    </Form>
  )
}
