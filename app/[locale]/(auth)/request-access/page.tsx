"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export default function RequestAccessPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        // Simulate submission
        setTimeout(() => {
            setIsSubmitting(false)
            setIsSubmitted(true)
        }, 2000)
    }

    if (isSubmitted) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('/subtle-spiritual-pattern-with-light-rays.jpg')] bg-cover bg-center opacity-5"></div>

                <div className="relative w-full max-w-md">
                    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl text-center">
                        <CardHeader className="space-y-4 pb-6">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-balance">Request Submitted</CardTitle>
                                <CardDescription className="text-base text-muted-foreground mt-2">
                                    Your access request has been sent successfully
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Your request will be reviewed by the congregation elders. You will receive an email notification once
                                your access has been approved.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button asChild className="w-full">
                                    <Link href="/signin">Back to Sign In</Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full bg-transparent">
                                    <Link href="/">Return Home</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/subtle-spiritual-pattern-with-light-rays.jpg')] bg-cover bg-center opacity-5"></div>

            <div className="relative w-full max-w-lg">
                {/* Back to Sign In Link */}
                <div className="mb-6">
                    <Link
                        href="/signin"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Sign In
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
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-balance">Request Admin Access</CardTitle>
                            <CardDescription className="text-base text-muted-foreground mt-2">
                                Suame JW Congregation Portal
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">
                                    Personal Information
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-sm font-medium">
                                            First Name *
                                        </Label>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            placeholder="John"
                                            required
                                            className="h-11 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-sm font-medium">
                                            Last Name *
                                        </Label>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            placeholder="Doe"
                                            required
                                            className="h-11 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email Address *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john.doe@example.com"
                                        required
                                        className="h-11 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium">
                                        Phone Number *
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+233 XX XXX XXXX"
                                        required
                                        className="h-11 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            {/* Congregation Role */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">
                                    Congregation Role
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-sm font-medium">
                                        Current Position *
                                    </Label>
                                    <Select required>
                                        <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20">
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="elder">Elder</SelectItem>
                                            <SelectItem value="ministerial-servant">Ministerial Servant</SelectItem>
                                            <SelectItem value="secretary">Secretary</SelectItem>
                                            <SelectItem value="accounts-servant">Accounts Servant</SelectItem>
                                            <SelectItem value="coordinator">Coordinator of Body of Elders</SelectItem>
                                            <SelectItem value="service-overseer">Service Overseer</SelectItem>
                                            <SelectItem value="other">Other (Please specify)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accessLevel" className="text-sm font-medium">
                                        Requested Access Level *
                                    </Label>
                                    <Select required>
                                        <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20">
                                            <SelectValue placeholder="Select access level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full">Full Administrative Access</SelectItem>
                                            <SelectItem value="records">Records Management Only</SelectItem>
                                            <SelectItem value="reports">Reports & Analytics Only</SelectItem>
                                            <SelectItem value="limited">Limited Access</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Justification */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">
                                    Access Justification
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="reason" className="text-sm font-medium">
                                        Reason for Access Request *
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Please explain why you need administrative access to the congregation portal..."
                                        required
                                        rows={4}
                                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="supervisor" className="text-sm font-medium">
                                        Supervising Elder
                                    </Label>
                                    <Input
                                        id="supervisor"
                                        type="text"
                                        placeholder="Name of elder who can verify your role"
                                        className="h-11 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            {/* Agreement */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <Checkbox id="agreement" required className="mt-1" />
                                    <div className="space-y-1">
                                        <Label htmlFor="agreement" className="text-sm font-medium leading-relaxed cursor-pointer">
                                            I understand and agree to the terms
                                        </Label>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            I confirm that I am an appointed brother in the Suame JW Congregation and understand that
                                            administrative access is a privilege that comes with responsibility. I agree to use this access
                                            solely for congregation purposes and maintain confidentiality of all information.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                        <span>Submitting Request...</span>
                                    </div>
                                ) : (
                                    "Submit Access Request"
                                )}
                            </Button>
                        </form>

                        {/* Help Information */}
                        <div className="pt-4 border-t border-border/50">
                            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                                <h4 className="text-sm font-medium text-foreground">Need Help?</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    If you have questions about the access request process, please contact the Coordinator of the Body of
                                    Elders or speak with any elder after the meeting.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground">
                        🔒 All access requests are reviewed by the body of elders. Processing may take 3-5 business days.
                    </p>
                </div>
            </div>
        </main>
    )
}
