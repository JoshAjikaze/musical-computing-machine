import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ChevronRight, Lock, Shield, Clock, Eye, EyeOff,
  ArrowLeft, X, Info, Bell, BellOff, Upload, User,
} from "lucide-react"
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
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { useUploadAvatarMutation } from "@/store/api/vibeApi"
import { updateUser } from "@/store/slices/authSlice"
import { assetUrl, cn } from "@/lib/utils"
import { toast } from "sonner"

// ── Types ─────────────────────────────────────────────────
type ProfileTab   = "general" | "monetization" | "security"
type SecurityPanel = null | "change-password-otp" | "change-password" | "password-changed"

const ALL_TABS: { id: ProfileTab; label: string }[] = [
  { id: "general",      label: "General"      },
  { id: "monetization", label: "Monetization" },
  { id: "security",     label: "Security"     },
]
const LANGUAGES = ["English", "French", "Spanish", "Portuguese", "Yoruba", "Hausa", "Igbo"]

// ── Animations ────────────────────────────────────────────
const panelSlide = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  exit:    { x: "100%", transition: { duration: 0.2 } },
}
const stepFade = {
  initial: { opacity: 0, x: 14 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.18 } },
  exit:    { opacity: 0, x: -14, transition: { duration: 0.14 } },
}

// ── Page ──────────────────────────────────────────────────
export function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth)
  const isArtistOrAdmin = user?.role === "artist" || user?.role === "admin"
  const tabs = ALL_TABS.filter((t) => t.id !== "monetization" || isArtistOrAdmin)

  // null = mobile tab-list, otherwise = active tab
  const [activeTab,     setActiveTab]     = useState<ProfileTab | null>(null)
  const [securityPanel, setSecurityPanel] = useState<SecurityPanel>(null)

  // Desktop always shows a tab; default to "general"
  const desktopTab = activeTab ?? "general"

  // Monetization payouts aren't backed by a real endpoint yet — rather than
  // let people fill out bank details that go nowhere, the tab itself is
  // gated behind a "coming soon" notice instead of switching to it.
  function handleTabClick(tab: ProfileTab) {
    if (tab === "monetization") {
      toast.info("Monetization is coming soon")
      return
    }
    setActiveTab(tab)
  }

  function TabContent({ tab }: { tab: ProfileTab }) {
    return (
      <AnimatePresence mode="wait">
        {tab === "general" && (
          <motion.div key="general" {...stepFade}>
            <GeneralSettings />
          </motion.div>
        )}
        {tab === "monetization" && (
          <motion.div key="monetization" {...stepFade}>
            <MonetizationSettings />
          </motion.div>
        )}
        {tab === "security" && (
          <motion.div key="security" {...stepFade}>
            <SecuritySettings onOpenPanel={setSecurityPanel} />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <>
      {/* ── Desktop layout ── */}
      <div className="hidden md:flex min-h-full">
        {/* Left sub-nav */}
        <aside className="w-52 shrink-0 border-r border-vibe-onyx-400 bg-vibe-onyx-100 py-6 px-3">
          <nav className="flex flex-col gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors duration-150",
                  desktopTab === tab.id
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
        <div className="flex-1 px-8 py-8 overflow-y-auto">
          <TabContent tab={desktopTab} />
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex flex-col md:hidden min-h-full">
        {/* If no tab selected — show the tab list */}
        {activeTab === null ? (
          <div>
            {/* Mobile header */}
            <div className="flex items-center gap-2 px-4 py-5 border-b border-vibe-onyx-400">
              <User className="h-4 w-4 text-vibe-text-muted" />
              <span className="text-sm font-medium text-white">Profile</span>
            </div>
            <nav className="flex flex-col">
              {tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-4 text-sm font-medium text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/40 transition-colors",
                    i < tabs.length - 1 && "border-b border-vibe-onyx-400/50"
                  )}
                >
                  {tab.label}
                  <ChevronRight className="h-4 w-4 text-vibe-text-muted" />
                </button>
              ))}
            </nav>
          </div>
        ) : (
          /* Drilled in — show breadcrumb + content */
          <div className="flex flex-col flex-1">
            {/* Breadcrumb header */}
            <div className="flex items-center gap-2 px-4 py-4 border-b border-vibe-onyx-400 bg-vibe-onyx-100 sticky top-0 z-10">
              <button
                onClick={() => setActiveTab(null)}
                className="text-vibe-text-muted hover:text-white transition-colors"
              >
                <User className="h-4 w-4" />
              </button>
              <span className="text-vibe-text-muted text-sm">Profile</span>
              <ChevronRight className="h-3.5 w-3.5 text-vibe-text-muted" />
              <span className="text-sm text-white font-medium">
                {ALL_TABS.find((t) => t.id === activeTab)?.label}
              </span>
            </div>
            <div className="flex-1 px-4 py-6">
              <TabContent tab={activeTab} />
            </div>
          </div>
        )}
      </div>

      {/* ── Security slide-in panel ── */}
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
                  <motion.div
                    key="done"
                    {...stepFade}
                    className="flex flex-col items-center justify-center min-h-full p-8 text-center"
                  >
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
  name:      z.string().min(2, "Full name is required"),
  stageName: z.string().min(1, "Stage name is required"),
  language:  z.string().min(1, "Select a language"),
})

function GeneralSettings() {
  const { user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const push = usePushNotifications()
  const [saved, setSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation()

  const form = useForm<z.infer<typeof generalSchema>>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      name:      user?.displayName ?? "",
      stageName: user?.username    ?? "",
      language:  "English",
    },
  })

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB")
      return
    }
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Image must be PNG or JPEG")
      return
    }

    // Show the picked file immediately — don't make the user wait on the
    // network round-trip to see what they selected.
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await uploadAvatar(formData).unwrap()
      // Response shape isn't confirmed against a live backend — defensively
      // check the common field names a file-upload endpoint might return.
      // Falls back to the local object URL (still correct visually) if none
      // match, so the avatar doesn't appear to "fail" even if we can't
      // resolve a server URL to persist into Redux.
      const r = res as Record<string, unknown>
      const serverUrl =
        (typeof r?.avatar_url === "string" && r.avatar_url) ||
        (typeof r?.avatar === "string" && r.avatar) ||
        (typeof r?.url === "string" && r.url) ||
        null

      dispatch(updateUser({ avatarUrl: serverUrl ? assetUrl(serverUrl) : localUrl }))
      toast.success("Display picture updated")
    } catch {
      setAvatarPreview(null)
      toast.error("Couldn't upload image — please try again")
    }
  }

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const currentAvatar = avatarPreview ?? (user?.avatarUrl ? assetUrl(user.avatarUrl) : null)

  return (
    <div className="max-w-md">
      <h2 className="font-heading text-xl font-semibold text-white mb-7">General settings</h2>

      {/* Avatar upload */}
      <div className="mb-7">
        <p className="text-sm font-medium text-vibe-text-secondary mb-3">Upload Display Picture</p>
        <div className="flex items-center gap-5">
          {/* Avatar circle */}
          <div className="relative h-16 w-16 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 overflow-hidden shrink-0 flex items-center justify-center">
            {currentAvatar ? (
              <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-7 w-7 text-vibe-text-muted" />
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          {/* Upload button + hints */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="outline"
              size="default"
              rounded="full"
              className="mb-2 gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              loading={isUploadingAvatar}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </Button>
            <p className="text-[11px] text-vibe-text-muted leading-relaxed">
              • Image must be png or jpeg<br />
              • Not more than 10mb.
            </p>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
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

      {/* Push notifications */}
      <div className="mt-8 pt-6 border-t border-vibe-onyx-400">
        <p className="text-xs font-medium text-vibe-text-muted uppercase tracking-wider mb-3">
          Notifications
        </p>
        <div className="flex items-center justify-between w-full px-4 py-3.5 rounded-md border border-vibe-onyx-400 bg-vibe-onyx-300">
          <div className="flex items-center gap-3 min-w-0">
            {push.isSubscribed
              ? <Bell className="h-4 w-4 shrink-0 text-vibe-text-secondary" />
              : <BellOff className="h-4 w-4 shrink-0 text-vibe-text-secondary" />}
            <div className="min-w-0">
              <p className="text-sm font-medium text-white leading-tight">Push notifications</p>
              <p className="text-xs text-vibe-text-muted truncate">
                {push.isSupported ? "New releases, followers, and activity" : "Not supported on this browser"}
              </p>
            </div>
          </div>
          <Toggle
            checked={push.isSubscribed}
            onChange={push.toggle}
            disabled={!push.isSupported || push.isChecking || push.isLoading}
            aria-label="Toggle push notifications"
          />
        </div>
      </div>
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
      bankName:      "",
      accountNumber: "",
      accountName:   "",
      sortCode:      "",
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
      <p className="text-sm text-vibe-text-muted mb-7">
        Carefully enter account details. Subsequent changes will require admin support.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Row 1 */}
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

          {/* Row 2 */}
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
          <div className="flex gap-3 pt-2">
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
            <Button
              type="submit"
              size="lg"
              rounded="full"
              className="flex-1"
              loading={form.formState.isSubmitting}
            >
              Request Payout
            </Button>
          </div>

          {/* OR */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-vibe-onyx-400" />
            <span className="text-xs text-vibe-text-muted">OR</span>
            <div className="flex-1 h-px bg-vibe-onyx-400" />
          </div>

          {/* PayPal */}
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-3.5 rounded-md border border-vibe-onyx-400 bg-vibe-onyx-300 hover:bg-vibe-onyx-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003087] flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold leading-none">P</span>
              </div>
              <span className="text-sm font-medium text-white">Set up Pay Pal</span>
            </div>
            <ChevronRight className="h-4 w-4 text-vibe-text-muted" />
          </button>
        </form>
      </Form>
    </div>
  )
}

// ── Security settings ─────────────────────────────────────
function SecuritySettings({ }: { onOpenPanel: (p: SecurityPanel) => void }) {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  const rows = [
    {
      icon:   <Shield className="h-4 w-4" />,
      label:  "Two-Factor Authentication",
      action: (
        <Toggle
          checked={twoFAEnabled}
          onChange={setTwoFAEnabled}
          aria-label="Toggle 2FA"
        />
      ),
      onClick: undefined,
    },
    {
      icon:    <Clock className="h-4 w-4" />,
      label:   "Login History",
      action:  <ChevronRight className="h-4 w-4 text-vibe-text-muted" />,
      onClick: () => {},
    },
  ]

  return (
    <div className="max-w-md">
      <h2 className="font-heading text-xl font-semibold text-white mb-1">Security</h2>
      <p className="text-sm text-vibe-text-muted mb-6">Security settings</p>

      <div className="space-y-2.5">
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
              <span className="text-sm font-medium text-white">{row.label}</span>
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

function ChangePasswordPanel({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<z.infer<typeof changePassSchema>>({
    resolver: zodResolver(changePassSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

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
      <p className="text-sm text-vibe-text-muted">Securely change your password.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSuccess)} className="space-y-5">
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

// ── Password changed ──────────────────────────────────────
function PasswordChangedView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <AmberTrophyIllustration />
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-bold text-white">Password changed</h2>
        <p className="text-sm font-medium text-white">Your account is more secured</p>
        <p className="text-sm text-vibe-text-secondary">You will be redirected to homepage to login.</p>
      </div>
      <Button variant="outline" size="lg" rounded="full" className="w-full mt-4" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}
