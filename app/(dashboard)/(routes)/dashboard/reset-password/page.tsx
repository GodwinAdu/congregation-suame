"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { resetPassword } from "@/lib/actions/user.actions"
import { toast } from "sonner"
import { Eye, EyeOff, Shield, Lock, CheckCircle, XCircle, AlertCircle, Key } from "lucide-react"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
  label: string
}

export default function ResetPasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "bg-gray-200",
    label: "Very Weak"
  })

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  const { isSubmitting, errors } = form.formState
  const newPassword = form.watch("newPassword")

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []
    
    if (password.length >= 8) score += 20
    else feedback.push("At least 8 characters")
    
    if (/[A-Z]/.test(password)) score += 20
    else feedback.push("One uppercase letter")
    
    if (/[a-z]/.test(password)) score += 20
    else feedback.push("One lowercase letter")
    
    if (/[0-9]/.test(password)) score += 20
    else feedback.push("One number")
    
    if (/[^A-Za-z0-9]/.test(password)) score += 20
    else feedback.push("One special character")
    
    let color = "bg-red-500"
    let label = "Very Weak"
    
    if (score >= 80) {
      color = "bg-green-500"
      label = "Very Strong"
    } else if (score >= 60) {
      color = "bg-blue-500"
      label = "Strong"
    } else if (score >= 40) {
      color = "bg-yellow-500"
      label = "Medium"
    } else if (score >= 20) {
      color = "bg-orange-500"
      label = "Weak"
    }
    
    return { score, feedback, color, label }
  }

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword))
    } else {
      setPasswordStrength({ score: 0, feedback: [], color: "bg-gray-200", label: "Very Weak" })
    }
  }, [newPassword])

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      await resetPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })
      toast.success("Password updated successfully! Please log in with your new password.")
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password")
    }
  }

  const requirements = [
    { test: (pwd: string) => pwd.length >= 8, label: "At least 8 characters" },
    { test: (pwd: string) => /[A-Z]/.test(pwd), label: "One uppercase letter" },
    { test: (pwd: string) => /[a-z]/.test(pwd), label: "One lowercase letter" },
    { test: (pwd: string) => /[0-9]/.test(pwd), label: "One number" },
    { test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd), label: "One special character" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">Create a strong, secure password to protect your account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Key className="w-5 h-5 text-blue-600" />
              Password Security
            </CardTitle>
            <CardDescription>
              Your password is your first line of defense. Make it count.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Current Password */}
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            className="pr-10 h-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* New Password */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className="pr-10 h-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Strength */}
                {newPassword && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Password Strength</span>
                      <Badge variant={passwordStrength.score >= 80 ? "default" : "secondary"} className={
                        passwordStrength.score >= 80 ? "bg-green-100 text-green-800" :
                        passwordStrength.score >= 60 ? "bg-blue-100 text-blue-800" :
                        passwordStrength.score >= 40 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }>
                        {passwordStrength.label}
                      </Badge>
                    </div>
                    <Progress value={passwordStrength.score} className="h-2" />
                    
                    <div className="grid grid-cols-1 gap-2">
                      {requirements.map((req, index) => {
                        const isValid = req.test(newPassword)
                        return (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {isValid ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={isValid ? "text-green-700" : "text-red-700"}>
                              {req.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            className="pr-10 h-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Security Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Security Tips</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Use a unique password you haven't used elsewhere</li>
                        <li>• Consider using a password manager</li>
                        <li>• Don't share your password with anyone</li>
                        <li>• Update your password regularly</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isSubmitting || passwordStrength.score < 80}
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating Password...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Update Password
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}