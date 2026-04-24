import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronRight, Lock, Shield, Clock, Eye, EyeOff, ArrowLeft, X, Info } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { OTPInput, useCountdown } from "@/components/features/auth/OTPInput"
import { AmberTrophyIllustration } from "@/components/app/AmberTrophyIllustration"
import { useAppSelector } from "@/hooks/redux"
import { cn } from "@/lib/utils"

// ── Sub-tab types ─────────────────────────────────────────
type ProfileTab = "general" | "monetization" | "security"

// ── Right-panel types (Security flows) ───────────────────
type SecurityPanel = null | "change-password-otp" | "change-password" | "password-changed"

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "general",      label: "General"      },
  { id: "monetization", label: "Monetization" },
  { id: "security",     label: "Security"     },
]

const LANGUAGES = ["English", "French", "Spanish", "Portuguese", "Yoruba", "Hausa", "Igbo"]

const panelSlide = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  exit:    { x: "100%", transition: { duration: 0.2 } },
}
const stepFade = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit:    { opacity: 0, x: -16, transition: { duration: 0.15 } },
}


// ── Page ──────────────────────────────────────────────────
export function ProfilePage() {
  const [activeTab, setActiveTab]     = useState<ProfileTab>("general")
  const [securityPanel, setSecurityPanel] = useState<SecurityPanel>(null)

  return (
    <>
      <div className="flex min-h-full">
        {/* Sub-nav */}
        <aside className="w-56 shrink-0 border-r border-vibe-onyx-400 bg-vibe-onyx-100 py-6 px-3">
          <nav className="flex flex-col gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-md text-sm font-body font-medium transition-colors duration-150",
                  activeTab === tab.id
                    ? "bg-vibe-onyx-300 text-white"
                    : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 px-8 py-6">
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <motion.div key="general" {...stepFade}>
                <GeneralSettings />
              </motion.div>
            )}
            {activeTab === "monetization" && (
              <motion.div key="monetization" {...stepFade}>
                <MonetizationSettings />
              </motion.div>
            )}
            {activeTab === "security" && (
              <motion.div key="security" {...stepFade}>
                <SecuritySettings onOpenPanel={setSecurityPanel} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Security right-panel */}
      <AnimatePresence>
        {securityPanel && (
          <>
            <motion.div
              key="sec-panel"
              {...panelSlide}
              className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[420px] bg-[#1c1c1c] border-l border-vibe-onyx-400 overflow-y-auto"
            >
              <AnimatePresence mode="wait">
                {securityPanel === "change-password-otp" && (
                  <motion.div key="otp" {...stepFade} className="p-8">
                    <PasswordOTPPanel
                      onVerified={() => setSecurityPanel("change-password")}
                      onClose={() => setSecurityPanel(null)}
                    />
                  </motion.div>
                )}
                {securityPanel === "change-password" && (
                  <motion.div key="change" {...stepFade} className="p-8">
                    <ChangePasswordPanel
                      onBack={() => setSecurityPanel("change-password-otp")}
                      onSuccess={() => setSecurityPanel("password-changed")}
                    />
                  </motion.div>
                )}
                {securityPanel === "password-changed" && (
                  <motion.div key="done" {...stepFade} className="flex flex-col items-center justify-center min-h-full p-8 text-center">
                    <PasswordChangedView onClose={() => setSecurityPanel(null)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div
              key="sec-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 hidden md:block"
              onClick={() => setSecurityPanel(null)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ── General settings ──────────────────────────────────────
const generalSchema = z.object({
  name:      z.string().min(2, "Name is required"),
  stageName: z.string().min(1, "Stage name is required"),
  language:  z.string().min(1, "Select a language"),
})

function GeneralSettings() {
  const { user } = useAppSelector((s) => s.auth)
  const [saved, setSaved] = useState(false)

  const form = useForm<z.infer<typeof generalSchema>>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      name:      user?.displayName ?? "Victor Desire",
      stageName: user?.username    ?? "vdeeze",
      language:  "English",
    },
  })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-md">
      <h2 className="font-heading text-xl font-semibold text-white mb-6">General settings</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input placeholder="Victor Desire" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="stageName" render={({ field }) => (
            <FormItem>
              <FormLabel>Stage name</FormLabel>
              <FormControl><Input placeholder="vdeeze" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="language" render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="English" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <Button
            type="submit"
            size="lg"
            rounded="full"
            className="w-full mt-2"
            loading={form.formState.isSubmitting}
          >
            {saved ? "Saved ✓" : "Save changes"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

// ── Monetization settings ─────────────────────────────────
const monetizationSchema = z.object({
  bankName:      z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(10, "Enter a valid account number"),
  accountName:   z.string().min(2, "Account name is required"),
  sortCode:      z.string().min(1, "Sort code is required"),
})

function MonetizationSettings() {
  const [saved, setSaved] = useState(false)

  const form = useForm<z.infer<typeof monetizationSchema>>({
    resolver: zodResolver(monetizationSchema),
    defaultValues: {
      bankName:      "Access Bank",
      accountNumber: "0042007935",
      accountName:   "Victor Desire",
      sortCode:      "ABNGLA",
    },
  })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-heading text-xl font-semibold text-white mb-1">Monetization</h2>
      <p className="text-sm text-vibe-text-muted mb-6">
        Carefully enter account details. Subsequent changes will require admin support.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Bank Name + Account Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="bankName" render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl><Input placeholder="Access Bank" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="accountNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl><Input placeholder="0042007935" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Account Name + Sort code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="accountName" render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl><Input placeholder="Victor Desire" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sortCode" render={({ field }) => (
              <FormItem>
                <FormLabel>Sort code</FormLabel>
                <FormControl><Input placeholder="ABNGLA" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="lg"
              rounded="full"
              className="flex-1"
              onClick={() => form.reset()}
            >
              {saved ? "Saved ✓" : "Save changes"}
            </Button>
            <Button type="submit" size="lg" rounded="full" className="flex-1"
              loading={form.formState.isSubmitting}>
              Request Payout
            </Button>
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-vibe-onyx-400" />
            <span className="text-xs text-vibe-text-muted">OR</span>
            <div className="flex-1 h-px bg-vibe-onyx-400" />
          </div>

          {/* PayPal row */}
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-3 rounded-md border border-vibe-onyx-400 bg-vibe-onyx-300 hover:bg-vibe-onyx-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* PayPal P icon */}
              <div className="w-6 h-6 rounded-full bg-[#003087] flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold leading-none">P</span>
              </div>
              <span className="text-sm font-medium text-vibe-text-primary">Set up Pay Pal</span>
            </div>
            <ChevronRight className="h-4 w-4 text-vibe-text-muted" />
          </button>
        </form>
      </Form>
    </div>
  )
}

// ── Security settings ─────────────────────────────────────
function SecuritySettings({ onOpenPanel }: { onOpenPanel: (p: SecurityPanel) => void }) {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  const rows = [
    {
      icon: <Lock className="h-4 w-4" />,
      label: "Change Password",
      action: <ChevronRight className="h-4 w-4 text-vibe-text-muted" />,
      onClick: () => onOpenPanel("change-password-otp"),
    },
    {
      icon: <Shield className="h-4 w-4" />,
      label: "Two-Factor Authentication",
      action: (
        <Toggle
          checked={twoFAEnabled}
          onChange={setTwoFAEnabled}
          aria-label="Toggle two-factor authentication"
        />
      ),
      onClick: undefined,
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Login History",
      action: <ChevronRight className="h-4 w-4 text-vibe-text-muted" />,
      onClick: () => {},
    },
  ]

  return (
    <div className="max-w-md">
      <h2 className="font-heading text-xl font-semibold text-white mb-1">Security</h2>
      <p className="text-sm text-vibe-text-muted mb-6">Security settings</p>

      <div className="space-y-3">
        {rows.map((row) => (
          <button
            key={row.label}
            type="button"
            onClick={row.onClick}
            className={cn(
              "flex items-center justify-between w-full px-4 py-3.5 rounded-md border border-vibe-onyx-400 bg-vibe-onyx-300 transition-colors",
              row.onClick ? "hover:bg-vibe-onyx-400 cursor-pointer" : "cursor-default"
            )}
          >
            <div className="flex items-center gap-3 text-vibe-text-secondary">
              {row.icon}
              <span className="text-sm font-medium">{row.label}</span>
            </div>
            {row.action}
          </button>
        ))}
      </div>

      <Button
        variant="default"
        size="lg"
        rounded="full"
        className="w-full mt-6"
        onClick={() => {}}
      >
        Logout of all other sessions
      </Button>
    </div>
  )
}

// ── Password OTP panel ────────────────────────────────────
function PasswordOTPPanel({
  onVerified, onClose,
}: { onVerified: () => void; onClose: () => void }) {
  const [otp, setOtp]               = useState("")
  const [verified, setVerified]     = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const { formatted, isDone, restart } = useCountdown(10)

  const maskedEmail = "ed*******22@yahoo.com"

  const handleOtpChange = async (val: string) => {
    setOtp(val)
    if (val.length === 4 && !verified) {
      await new Promise((r) => setTimeout(r, 500))
      setVerified(true)
      setShowBanner(true)
      setTimeout(onVerified, 1400)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onClose} className="text-white hover:text-vibe-text-secondary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-xl font-semibold text-white">Password Reset</h2>
      </div>

      <p className="text-sm text-vibe-text-muted leading-relaxed">
        Enter the 4-digit code we have sent via the email address{" "}
        <span className="text-vibe-text-secondary">{maskedEmail}</span>
      </p>

      {/* Success banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
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
        <p className="text-sm text-vibe-text-muted">
          Resend in{" "}
          <span className="text-white underline underline-offset-2 font-medium">{formatted}</span>
        </p>
      </div>

      <Button
        size="lg" rounded="full" className="w-full"
        onClick={isDone ? () => { setOtp(""); setVerified(false); setShowBanner(false); restart() } : undefined}
        disabled={!isDone || verified}
      >
        Resend
      </Button>
    </div>
  )
}

// ── Change password panel ─────────────────────────────────
const changePassSchema = z.object({
  password:        z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Password must be same as above.",
  path: ["confirmPassword"],
})

function ChangePasswordPanel({
  onBack, onSuccess,
}: { onBack: () => void; onSuccess: () => void }) {
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<z.infer<typeof changePassSchema>>({
    resolver: zodResolver(changePassSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700))
    onSuccess()
  }

  const ToggleEye = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} className="text-vibe-text-muted hover:text-white transition-colors">
      {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-white hover:text-vibe-text-secondary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-xl font-semibold text-white">Change Password</h2>
      </div>
      <p className="text-sm text-vibe-text-muted">Securely change your password,</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type={showPass ? "text" : "password"} placeholder="••••••••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  suffix={<ToggleEye show={showPass} toggle={() => setShowPass((v) => !v)} />}
                  {...field} />
              </FormControl>
              <FormDescription>Must be at least 8 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem>
              <FormLabel>Retype Password</FormLabel>
              <FormControl>
                <Input type={showConfirm ? "text" : "password"} placeholder="••••••••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  suffix={<ToggleEye show={showConfirm} toggle={() => setShowConfirm((v) => !v)} />}
                  {...field} />
              </FormControl>
              <FormDescription>Password must be same as above.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" size="lg" rounded="full" className="w-full"
            loading={form.formState.isSubmitting}>
            Change password
          </Button>
        </form>
      </Form>
    </div>
  )
}

// ── Password changed success ──────────────────────────────
function PasswordChangedView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <AmberTrophyIllustration />
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-bold text-white">Password changed</h2>
        <p className="text-sm font-medium text-white">Your account is more secured</p>
        <p className="text-sm text-vibe-text-secondary">you will be redirected to homepage to login.</p>
      </div>
      <Button variant="outline" size="lg" rounded="full" className="w-full mt-4" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}
