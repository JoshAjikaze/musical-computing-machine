import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileDropzone } from "@/components/app/FileDropzone"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const TOPICS = [
  "Payment issues",
  "Upload problems",
  "Account access",
  "Royalty disputes",
  "Content takedown",
  "Technical support",
  "Other",
]

const supportSchema = z.object({
  topic:   z.string().min(1, "Please select a topic"),
  message: z.string().min(10, "Please give us more details"),
})

type SupportValues = z.infer<typeof supportSchema>

export function SupportPage() {
  const [incident, setIncident] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<SupportValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: { topic: "Payment issues", message: "" },
  })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700))
    setSubmitted(true)
    form.reset()
    setIncident(null)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="max-w-md">
        <h1 className="font-heading text-2xl font-bold text-white mb-6">Customer support</h1>

        {/* Success toast */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 px-4 py-3 rounded-md bg-green-500/20 border border-green-500/40 mb-5"
            >
              <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
              <span className="text-sm text-green-400">Message sent! We'll be in touch soon.</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Topic */}
            <FormField control={form.control} name="topic" render={({ field }) => (
              <FormItem>
                <FormLabel>Topic</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Payment issues" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Message body */}
            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem>
                <FormLabel>Message body</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Give us details"
                    className="flex min-h-[120px] w-full rounded-sm border border-vibe-onyx-400 bg-vibe-onyx-200 px-4 py-3 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted resize-none focus-visible:outline-none focus-visible:border-vibe-red focus-visible:ring-1 focus-visible:ring-vibe-red/30 transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Upload incident */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-vibe-text-secondary">Upload incident</p>
              <FileDropzone
                accept="image/*"
                hint="JPG, PNG or GIF - Max file size 4MB"
                maxSizeMB={4}
                value={incident}
                onChange={setIncident}
                type="image"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              rounded="full"
              className="w-full"
              loading={form.formState.isSubmitting}
            >
              Send message
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
