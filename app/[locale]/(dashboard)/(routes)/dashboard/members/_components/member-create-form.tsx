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
import { Loader2, User, Mail, Lock, Users, Car, CalendarIcon, Plus, X, Crown, MapPin } from "lucide-react"
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
        email: z.string().optional(),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        gender: z.string().min(2, "Gender is required"),
        dob: z.date().optional(),
        baptizedDate: z.date().optional(),
        address: z.string().optional(),
        emergencyContact: z.string().optional(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
        role: z.string().min(1, "Please select a role"),
        groupId: z.string(),
        privileges: z.array(z.string()),
        familyRelationships: z.array(z.object({
            memberId: z.string(),
            relationship: z.string()
        })).optional(),
        isFamilyHead: z.boolean().optional(),
        location: z.object({
            latitude: z.number().optional(),
            longitude: z.number().optional(),
            address: z.string().optional(),
            isPublic: z.boolean().optional()
        }).optional()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

type RegistrationFormData = z.infer<typeof registrationSchema>


export default function UserRegistrationForm({ roles, groups, privileges, members }: { roles: any[], groups: any[], privileges: any[], members: any[] }) {
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [familyRelationships, setFamilyRelationships] = useState<Array<{ memberId: string; memberName: string; relationship: string }>>([])
    const [isFamilyHead, setIsFamilyHead] = useState(false)

    const form = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            password: "111111",
            confirmPassword: "111111",
            role: "",
            groupId: "",
            privileges: [],
            familyRelationships: [],
            isFamilyHead: false,
            location: {
                latitude: undefined,
                longitude: undefined,
                address: "",
                isPublic: false
            }
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (data: RegistrationFormData) => {
        try {
            const memberData = {
                ...data,
                familyRelationships: familyRelationships.filter(r => r.memberId).map(r => ({
                    memberId: r.memberId,
                    relationship: r.relationship
                })),
                isFamilyHead
            }
            await createMember(memberData);

            form.reset();
            setFamilyRelationships([]);
            setIsFamilyHead(false);
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
                    <CardTitle className="text-3xl font-bold text-foreground">Suame Congregation</CardTitle>
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

                                    <FormField
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Role *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-input border-border focus:ring-primary">
                                                            <SelectValue placeholder="Select your role" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="publisher">publisher</SelectItem>
                                                        {roles.map((role) => (
                                                            <SelectItem key={role._id} value={role.name}>
                                                                {role.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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
                                    <FormField
                                        control={form.control}
                                        name="baptizedDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Baptized Date</FormLabel>
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
                                                    Enter the date for baptism.
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

                            {/* Group Assignment Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold text-foreground">Group Assignment</h3>
                                </div>

                                <div className="flex gap-5">
                                    <FormField
                                        control={form.control}
                                        name="groupId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Preferred Group</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-input border-border focus:ring-primary">
                                                            <SelectValue placeholder="Select a group (optional)" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {groups.map((group) => (
                                                            <SelectItem key={group._id} value={group._id}>
                                                                {group.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="privileges"
                                        defaultValue={[]} // Initialize as an empty array
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Add Privileges</FormLabel>
                                                <FormControl>
                                                    <MultiSelect
                                                        placeholder="Require Privileges"
                                                        data={privileges}
                                                        value={field.value || []} // Ensure value is an array
                                                        onChange={(privilege) =>
                                                            field.onChange([...field.value, privilege])
                                                        }
                                                        onRemove={(idToRemove) =>
                                                            field.onChange(field.value.filter(
                                                                (privilegeId) => privilegeId !== idToRemove
                                                            ))
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-1" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                            </div>

                            {/* Family Relationships Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold text-foreground">Family Relationships</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground">Add family members and their relationships</p>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={isFamilyHead ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setIsFamilyHead(!isFamilyHead)}
                                            >
                                                <Crown className="w-4 h-4 mr-2" />
                                                {isFamilyHead ? "Family Head" : "Set as Family Head"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFamilyRelationships([...familyRelationships, { memberId: '', memberName: '', relationship: 'other' }])}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Family Member
                                            </Button>
                                        </div>
                                    </div>

                                    {familyRelationships.map((relationship, index) => (
                                        <div key={index} className="flex gap-2 items-end p-3 bg-muted/50 rounded-lg">
                                            <div className="flex-1">
                                                <label className="text-xs font-medium text-muted-foreground">Family Member</label>
                                                <Select
                                                    value={relationship.memberId}
                                                    onValueChange={(value) => {
                                                        const member = members.find(m => m._id === value)
                                                        const updated = [...familyRelationships]
                                                        updated[index] = { ...updated[index], memberId: value, memberName: member?.fullName || '' }
                                                        setFamilyRelationships(updated)
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select member" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {members.map((member) => (
                                                            <SelectItem key={member._id} value={member._id}>
                                                                {member.fullName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-32">
                                                <label className="text-xs font-medium text-muted-foreground">Relationship</label>
                                                <Select
                                                    value={relationship.relationship}
                                                    onValueChange={(value) => {
                                                        const updated = [...familyRelationships]
                                                        updated[index] = { ...updated[index], relationship: value }
                                                        setFamilyRelationships(updated)
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="father">Father</SelectItem>
                                                        <SelectItem value="mother">Mother</SelectItem>
                                                        <SelectItem value="son">Son</SelectItem>
                                                        <SelectItem value="daughter">Daughter</SelectItem>
                                                        <SelectItem value="husband">Husband</SelectItem>
                                                        <SelectItem value="wife">Wife</SelectItem>
                                                        <SelectItem value="brother">Brother</SelectItem>
                                                        <SelectItem value="sister">Sister</SelectItem>
                                                        <SelectItem value="grandfather">Grandfather</SelectItem>
                                                        <SelectItem value="grandmother">Grandmother</SelectItem>
                                                        <SelectItem value="grandson">Grandson</SelectItem>
                                                        <SelectItem value="granddaughter">Granddaughter</SelectItem>
                                                        <SelectItem value="uncle">Uncle</SelectItem>
                                                        <SelectItem value="aunt">Aunt</SelectItem>
                                                        <SelectItem value="nephew">Nephew</SelectItem>
                                                        <SelectItem value="niece">Niece</SelectItem>
                                                        <SelectItem value="cousin">Cousin</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFamilyRelationships(familyRelationships.filter((_, i) => i !== index))}
                                                className="h-8 w-8 p-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold text-foreground">Home Location (Optional)</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="location.latitude"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Latitude</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        placeholder="e.g., 6.6745"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                        className="bg-input border-border focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="location.longitude"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Longitude</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        placeholder="e.g., -1.5716"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                        className="bg-input border-border focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="location.address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground font-medium">Location Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Specific location address (optional)"
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
                                    name="location.isPublic"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Make location visible to elders</FormLabel>
                                                <FormDescription>
                                                    Allow elders and overseers to see this member's location for pastoral visits
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="h-4 w-4"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className=" bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg"
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
