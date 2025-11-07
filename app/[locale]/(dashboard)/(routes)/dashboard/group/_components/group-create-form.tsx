"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Mail, Lock, Users, Car, CalendarIcon } from "lucide-react"
import MultiSelect from "@/components/commons/MultiSelect"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { createMember } from "@/lib/actions/user.actions"

// Form validation schema
const registrationSchema = z
    .object({
        fullName: z.string().min(2, "Full name must be at least 2 characters"),
        email: z.email().optional(),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        gender: z.string().min(2, "Gender is required"),
        dob: z.date().optional(),
        address: z.string().optional(),
        emergencyContact: z.string().optional(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

type RegistrationFormData = z.infer<typeof registrationSchema>


export default function GroupRegistrationForm({ group }: {  group: any }) {
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const form = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            gender:"",
            emergencyContact:"",
            address:"",
            password: "111111",
            confirmPassword: "111111",
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (data: RegistrationFormData) => {
        try {
            await createMember(data);

            form.reset();
            toast.success("Member created successfully!");
            setSubmitSuccess(true);
        } catch (error) {
            console.error("Registration failed:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create member");
        }
    }

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30 flex items-center justify-center p-4">
                <Card className="w-full max-w-md backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
                    <CardContent className="pt-6 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome!</h2>
                        <p className="text-muted-foreground mb-6">
                            Your registration has been submitted successfully. You&apos;ll receive a confirmation email shortly.
                        </p>
                        <Button onClick={() => setSubmitSuccess(false)} className="w-full">
                            Register Another User
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/30 flex items-center justify-center p-4">
            <Card className="w-full  backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground">{group?.name}</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg">
                        Register to become part of our spiritual family
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Personal Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Full Name *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter your full name"
                                                        {...field}
                                                        className="bg-input border-border focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Mail className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Email Address *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="your.email@example.com"
                                                        {...field}
                                                        className="bg-input border-border focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Phone Number *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="tel"
                                                        placeholder="(555) 123-4567"
                                                        {...field}
                                                        className="bg-input border-border focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Gender</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-input border-border focus:ring-primary">
                                                            <SelectValue placeholder="Select gender" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dob"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date of birth</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-[240px] pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            captionLayout="dropdown"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormDescription>
                                                    Your date of birth is used to calculate your age.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground font-medium">Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter full address"
                                                    {...field}
                                                    className="bg-input border-border focus:ring-primary"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="emergencyContact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground font-medium">Emergency Contact</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Emergency contact number"
                                                    {...field}
                                                    className="bg-input border-border focus:ring-primary"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Security Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lock className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold text-foreground">Account Security</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Password *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Create a secure password"
                                                        {...field}
                                                        className="bg-input border-border focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Confirm Password *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Confirm your password"
                                                        {...field}
                                                        className="bg-input border-border focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>



                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {/* Footer Message */}
                    <div className="text-center pt-4 border-t border-border/50">
                        <p className="text-muted-foreground text-sm">
                            By registering, you&apos;re taking the first step in joining our spiritual community.
                            <br />
                            <span className="text-primary font-medium">Welcome to the family!</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
