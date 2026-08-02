import { useReducer, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { AuthShell } from "@/components/features/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form"
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/store/api/vibeApi"

// ── Wizard ────────────────────────────────────────────────
// Step 1: request a reset_token via email. Step 2: use that token to set a
// new password. No OTP step — /auth/forgot-password returns the reset_token
// directly in its response body.
type ResetStep = 1 | 2

interface ResetState { step: ResetStep; resetToken: string }
type ResetAction =
  | { type: "TOKEN_RECEIVED"; token: string }
  | { type: "BACK" }

function reducer(state: ResetState, action: ResetAction): ResetState {
  switch (action.type) {
    case "TOKEN_RECEIVED": return { step: 2, resetToken: action.token }
    case "BACK":           return { step: 1, resetToken: "" }
    default:                return state
  }
}

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit:    { opacity: 0, x: -24, transition: { duration: 0.2 } },
}

export function ForgotPasswordPage() {
  const [state, dispatch] = useReducer(reducer, { step: 1, resetToken: "" })

  return (
    <AuthShell showBack={state.step > 1} onBack={() => dispatch({ type: "BACK" })}>
      <AnimatePresence mode="wait">
        {state.step === 1 && (
          <motion.div key="step1" {...slide}>
            <ResetStep1 onNext={(token) => dispatch({ type: "TOKEN_RECEIVED", token })} />
          </motion.div>
        )}
        {state.step === 2 && (
          <motion.div key="step2" {...slide}>
            <ResetStep2 resetToken={state.resetToken} />
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

function ResetStep1({ onNext }: { onNext: (resetToken: string) => void }) {
  const [callForgotPw, { isLoading }] = useForgotPasswordMutation()
  const form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: "" },
  })

  const handleSubmit = async (v: z.infer<typeof step1Schema>) => {
    try {
      const res = await callForgotPw({ email: v.email }).unwrap()
      onNext(res.reset_token)
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
            Enter your email address and we'll get you started on resetting your password.
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
          Continue
        </Button>
      </form>
    </Form>
  )
}

// ── Step 2 — New password ─────────────────────────────────
const step2Schema = z.object({
  password: z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Password must be same as above.",
  path: ["confirmPassword"],
})

function ResetStep2({ resetToken }: { resetToken: string }) {
  const navigate = useNavigate()
  const [showPass, setShowPass]         = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [resetPassword, { isLoading }]  = useResetPasswordMutation()

  const form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const onSubmit = async (values: z.infer<typeof step2Schema>) => {
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
