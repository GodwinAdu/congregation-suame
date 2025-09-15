"use client";

// FeedbackModal.tsx
import React, { useActionState, useId, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";


const FeedbackModal = () => {
    const id = useId()
    interface FeedbackState {
        success: boolean;
        message: string;
    }

    type FormAction = (formData: FormData) => void;

    const [state, formAction, isPending]: [FeedbackState, FormAction, boolean] = useActionState((state, formData: FormData) => sendFeedback(formData), { success: false, message: '' })
    const [area, setArea] = useState("billing")
    const [securityLevel, setSecurityLevel] = useState("2")

    const handleSubmit = (formData: FormData) => {
        formData.append('area', area)
        formData.append('securityLevel', securityLevel)
        formAction(formData)

    }

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <button
                        className="fixed -right-8 bottom-72 bg-primary/80 text-white py-1 px-2 rounded-lg hover:bg-primary transform rotate-90 z-50"
                    >
                        Feedback
                    </button>
                </DialogTrigger>
                <DialogContent className="w-[96%] max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report an issue</CardTitle>
                            <CardDescription>
                                What area are you having problems with?
                            </CardDescription>
                        </CardHeader>
                        <form action={handleSubmit}>
                            <CardContent className="grid gap-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor={`area-${id}`}>Area</Label>
                                        <Select value={area} onValueChange={setArea}>
                                            <SelectTrigger id={`area-${id}`} aria-label="Area">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="models">Models</SelectItem>
                                                <SelectItem value="api key">Api Keys</SelectItem>
                                                <SelectItem value="donation">Donations</SelectItem>
                                                <SelectItem value="support">Support</SelectItem>
                                                <SelectItem value="other">Others</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`security-level-${id}`}>Security Level</Label>
                                        <Select value={securityLevel} onValueChange={setSecurityLevel}>
                                            <SelectTrigger
                                                id={`security-level-${id}`}
                                                className="w-full truncate"
                                                aria-label="Security Level"
                                            >
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Severity 1 (Highest)</SelectItem>
                                                <SelectItem value="2">Severity 2</SelectItem>
                                                <SelectItem value="3">Severity 3</SelectItem>
                                                <SelectItem value="4">Severity 4 (Lowest)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`subject-${id}`}>Subject</Label>
                                    <Input id={`subject-${id}`} name="subject" placeholder="I need help with..." required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`description-${id}`}>Description</Label>
                                    <Textarea
                                        id={`description-${id}`}
                                        name="description"
                                        placeholder="Please include all information relevant to your issue."
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`email-${id}`}>Your Email</Label>
                                    <Input id={`email-${id}`} name="email" type="email" placeholder="your@email.com" required />
                                </div>
                            </CardContent>
                            <CardFooter className="justify-between space-x-2">
                                <Button type="submit" size="sm" disabled={isPending}>
                                    {isPending ? 'Submitting...' : 'Submit'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                    {state.message !== '' && (
                        <div className={`mt-4 p-4 rounded-md ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {state.message}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default FeedbackModal;
