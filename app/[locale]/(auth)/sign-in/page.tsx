"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { toast } from "sonner"
import { loginUser } from "@/lib/actions/login.actions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"


const formSchema = z.object({
  email: z.email({
    message: "email is required.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters or more.",
  }),
  rememberMe: z.boolean()
})


export default function SignInPage() {
  const router = useRouter()
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  });

  const {isSubmitting} = form.formState;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const user = await loginUser(values)

      form.reset();
      router.push("/en/dashboard")

      toast.success(`Welcome Back, ${user?.fullName}`, {
        description: "You'll be redirect to dashboard"
      })

    } catch (error) {
      console.log(error)
      toast.error("Something went wrong", {
        description: "Please try again later"
      })
    }
  }


  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/subtle-spiritual-pattern-with-light-rays.jpg')] bg-cover bg-center opacity-5"></div>

      <div className="relative w-full max-w-md">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v2"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-balance">Administrator Sign In</CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                Suame JW Congregation Portal
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel> Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="junior@gmail.com" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel> Enter Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter password" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} ref={field.ref} id={field.name} />
                      </FormControl>
                      <FormLabel htmlFor={field.name} className="text-sm text-muted-foreground cursor-pointer">
                        Remember Me for 30 days
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button disabled={isSubmitting} className="w-full" type="submit">
                  {isSubmitting && <Loader2 className="animate-spin w-4 h-4" /> }
                  {isSubmitting ? "Please wait...":"Log In"}
                </Button>
              </form>
            </Form>


            {/* Role Information */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground mb-3">Authorized Personnel Only</p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-medium text-primary/90">Elders & MS</p>
                  <p className="text-xs text-foreground/70">Full Access</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-medium text-primary/90">Secretary</p>
                  <p className="text-xs text-foreground/70">Records Only</p>
                </div>
              </div>
            </div>

            {/* Request Access */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Need access?{" "}
                <Link
                  href="/request-access"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Request Access
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 This is a secure portal for authorized congregation administrators only. All access is logged and
            monitored.
          </p>
        </div>
      </div>
    </main>
  )
}
