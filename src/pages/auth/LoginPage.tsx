import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { AuthShell } from "@/components/features/auth/AuthShell"
import { GoogleButton } from "@/components/features/auth/GoogleButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form"
import { useAppDispatch } from "@/hooks/redux"
import { setCredentials } from "@/store/slices/authSlice"
import { useLoginMutation, useGetCurrentUserQuery, normaliseUser } from "@/store/api/vibeApi"
import { toast } from "sonner"

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})
type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const dispatch   = useAppDispatch()
  const navigate   = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [accessToken, setAccessToken]   = useState<string | null>(null)

  // Once we have the access_token, fetch the full user profile
  const { data: meData } = useGetCurrentUserQuery(undefined, { skip: !accessToken })
 
  // When profile data arrives, commit to Redux and navigate by role
  useEffect(() => {
    if (meData && accessToken) {
      const user = normaliseUser(meData)
      dispatch(setCredentials({ user, token: accessToken }))
      if (user.role === 'admin')       navigate('/admin',  { replace: true })
      else if (user.role === 'artist') navigate('/app',    { replace: true })
      else                             navigate('/listen', { replace: true })
    }
  }, [meData, accessToken, dispatch, navigate])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await login(values).unwrap()
      const token = result.access_token
      localStorage.setItem("vibe_token", token)
      setAccessToken(token)
      toast.success("Welcome back!")
    } catch {
      form.setError("email", { message: "Invalid email or password" })
      toast.error("Invalid email or password")
    }
  }

  return (
    <AuthShell>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
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

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    icon={<Lock className="h-4 w-4" />}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-vibe-text-muted hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword
                          ? <Eye className="h-4 w-4" />
                          : <EyeOff className="h-4 w-4" />
                        }
                      </button>
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Forgot password — amber, right-aligned */}
          <div className="flex justify-end -mt-2">
            <Link
              to="/forgot-password"
              className="text-sm text-vibe-amber hover:text-vibe-amber-light transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign in */}
          <Button type="submit" size="lg" rounded="full" className="w-full mt-1" loading={isLoading}>
            Sign in
          </Button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-vibe-onyx-400" />
            <div className="flex-1 h-px bg-vibe-onyx-400" />
          </div>

          {/* Google */}
          <GoogleButton label="Sign in with  Google" />

          {/* Join link */}
          <p className="text-center text-sm text-vibe-text-muted pt-1">
            Don't have an account?{" "}
            <Link to="/join" className="text-white font-semibold hover:text-vibe-text-secondary transition-colors">
              Join the Vibe
            </Link>
          </p>
        </form>
      </Form>
    </AuthShell>
  )
}
