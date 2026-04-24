import { useReducer, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { AuthShell } from "@/components/features/auth/AuthShell"
import { GoogleButton } from "@/components/features/auth/GoogleButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAppDispatch } from "@/hooks/redux"
import { setPendingEmail } from "@/store/slices/authSlice"
import { useRegisterMutation } from "@/store/api/vibeApi"
import { cn } from "@/lib/utils"

// ── Wizard state ──────────────────────────────────────────
interface WizardState {
  step: 1 | 2 | 3
  email: string
  fullName: string
  gender: string
  dob: string
  role: string
}

type WizardAction =
  | { type: "NEXT_STEP1"; email: string }
  | { type: "NEXT_STEP2"; fullName: string; gender: string; dob: string }
  | { type: "BACK" }

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT_STEP1": return { ...state, step: 2, email: action.email }
    case "NEXT_STEP2": return { ...state, step: 3, fullName: action.fullName, gender: action.gender, dob: action.dob }
    case "BACK":       return { ...state, step: (state.step - 1) as 1 | 2 | 3 }
    default:           return state
  }
}

const initial: WizardState = {
  step: 1, email: "", fullName: "", gender: "", dob: "", role: "",
}

// ── Slide animation ───────────────────────────────────────
const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit:    { opacity: 0, x: -24, transition: { duration: 0.2, ease: "easeIn" } },
}

export function JoinPage() {
  const [wizard, wizDispatch] = useReducer(reducer, initial)

  return (
    <AuthShell showBack={wizard.step > 1} onBack={() => wizDispatch({ type: "BACK" })}>
      <AnimatePresence mode="wait">
        {wizard.step === 1 && (
          <motion.div key="step1" {...slide}>
            <Step1 onNext={(email) => {wizDispatch({ type: "NEXT_STEP1", email }); localStorage.setItem("email", email)}} />
          </motion.div>
        )}
        {wizard.step === 2 && (
          <motion.div key="step2" {...slide}>
            <Step2
              onNext={(fullName, gender, dob) =>
                wizDispatch({ type: "NEXT_STEP2", fullName, gender, dob })
              }
            />
          </motion.div>
        )}
        {wizard.step === 3 && (
          <motion.div key="step3" {...slide}>
            <Step3 wizard={wizard} />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}

// ── Step 1 — Email ────────────────────────────────────────
const step1Schema = z.object({
  email: z.string().email("Enter a valid email address"),
})

function Step1({ onNext }: { onNext: (email: string) => void }) {
  const form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => onNext(v.email))} className="space-y-5">
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

        <Button type="submit" size="lg" rounded="full" className="w-full">
          Continue
        </Button>

        <GoogleButton label="Join with  Google" />

        <p className="text-center text-sm text-vibe-text-muted pt-1">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-semibold hover:text-vibe-text-secondary transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  )
}

// ── Step 2 — Name / Gender / DOB ─────────────────────────
const step2Schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  gender:   z.string().min(1, "Select a gender"),
  dob:      z.string().min(1, "Select your date of birth"),
})

// Generate DOB options — years 1920–2010 for picker
const YEARS  = Array.from({ length: 91 }, (_, i) => (2010 - i).toString())
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"))

function Step2({ onNext }: { onNext: (fullName: string, gender: string, dob: string) => void }) {
  const [day, setDay]     = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear]   = useState("")

  const form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: { fullName: "", gender: "", dob: "" },
  })

  const handleSubmit = form.handleSubmit((v) => {
    const dob = `${day}/${String(MONTHS.indexOf(month) + 1).padStart(2,"0")}/${year}`
    onNext(v.fullName, v.gender, dob)
  })

  // Sync the assembled DOB string into the form value so Zod sees it
  const updateDob = (d: string, m: string, y: string) => {
    if (d && m && y) form.setValue("dob", `${d}/${m}/${y}`, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter full name"
                  icon={<User className="h-4 w-4" />}
                  {...field}
                />
              </FormControl>
              <FormDescription>Only your government identified name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Male" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth — three chained selects */}
        <FormField
          control={form.control}
          name="dob"
          render={() => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                {/* Day */}
                <Select
                  value={day}
                  onValueChange={(v) => { setDay(v); updateDob(v, month, year) }}
                >
                  <SelectTrigger className="text-vibe-text-muted data-[state=open]:text-white">
                    <SelectValue placeholder="DD" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* Month */}
                <Select
                  value={month}
                  onValueChange={(v) => { setMonth(v); updateDob(day, v, year) }}
                >
                  <SelectTrigger className="text-vibe-text-muted data-[state=open]:text-white">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={m}>
                        {String(i + 1).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year */}
                <Select
                  value={year}
                  onValueChange={(v) => { setYear(v); updateDob(day, month, v) }}
                >
                  <SelectTrigger className="text-vibe-text-muted data-[state=open]:text-white">
                    <SelectValue placeholder="YY" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <FormDescription>Don't worry your information is private.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" rounded="full" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  )
}

// ── Step 3 — Role / Password / Terms ─────────────────────
const step3Schema = z.object({
  role:    z.string().min(1, "Select how you'll use Vibe Garage"),
  password: z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Password must be same as above.",
  path: ["confirmPassword"],
})

function Step3({ wizard }: { wizard: WizardState }) {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: { role: "", password: "", confirmPassword: "", terms: undefined },
  })

  // Map UI role selection → backend enum
  const ROLE_MAP: Record<string, 'LISTENER' | 'ARTIST'> = {
    fan:      'LISTENER',
    listener: 'LISTENER',
    artist:   'ARTIST',
    label:    'ARTIST',
    producer: 'ARTIST',
  }

  // dob from Step2 is stored as DD/MM/YY — convert to YYYY-MM-DD for API
  const formatDob = (raw: string): string => {
    const parts = raw.split('/')
    if (parts.length !== 3) return raw
    const [d, m, y] = parts
    const year = y.length === 2 ? `20${y}` : y
    return `${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
  }

  const onSubmit = async (values: z.infer<typeof step3Schema>) => {
    try {
      await register({
        email:      wizard.email,
        password:   values.password,
        username:   wizard.fullName.replace(/\s+/g, '_').toLowerCase(),
        full_name:  wizard.fullName,
        stage_name: wizard.fullName,
        dob:        formatDob(wizard.dob),
        role:       ROLE_MAP[values.role.toLowerCase()] ?? 'LISTENER',
      }).unwrap()
      // Signup returns UserResponse (no token). Store email for verify page.
      dispatch(setPendingEmail(wizard.email))
      navigate('/verify')
    } catch {
      form.setError('role', { message: 'Registration failed. Please try again.' })
    }
  }

  const ToggleIcon = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button
      type="button"
      onClick={toggle}
      className="text-vibe-text-muted hover:text-white transition-colors"
    >
      {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Role */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How do you want to use Vibe Garage?</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger icon={<User className="h-4 w-4" />}>
                    <SelectValue placeholder="Artist" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fan">Fan / Listener</SelectItem>
                  <SelectItem value="artist">Artist</SelectItem>
                  <SelectItem value="label">Record Label</SelectItem>
                  <SelectItem value="producer">Producer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
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

        {/* Confirm password */}
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

        {/* Terms checkbox */}
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <FormLabel className="text-sm text-vibe-text-secondary font-normal leading-snug cursor-pointer">
                  I agree to Vibe Garage's{" "}
                  <Link to="/privacy" className="text-vibe-amber hover:text-vibe-amber-light transition-colors">
                    Privacy Policy
                  </Link>
                  {" "}and{" "}
                  <Link to="/terms" className="text-vibe-amber hover:text-vibe-amber-light transition-colors">
                    Terms of Use
                  </Link>
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Create account — disabled until terms checked */}
        <Button
          type="submit"
          size="lg"
          rounded="full"
          className={cn(
            "w-full transition-all",
            !form.watch("terms") && "opacity-40 cursor-not-allowed"
          )}
          loading={isLoading}
          disabled={!form.watch("terms")}
        >
          Create account
        </Button>
      </form>
    </Form>
  )
}
