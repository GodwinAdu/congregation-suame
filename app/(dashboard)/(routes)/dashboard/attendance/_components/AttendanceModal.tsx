"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { createAttendance } from "@/lib/actions/attendance.actions";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    attendance: z.coerce.number({
    error: "Attendance is required"}).min(0, {message: "Attendance cannot be negative"}),
    date: z.date()
});

export function AttendanceModal() {

    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            attendance: 0,
            date: new Date()
        },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const attendanceData = {
                attendance: values.attendance,
                date: new Date(values.date),
                month: new Date(values.date).getMonth() + 1
            };

            await createAttendance(attendanceData);
            form.reset();
            setOpen(false);
            toast.success("Attendance recorded", {
                description: "Attendance has been added successfully",
            });
            window.location.reload()
        } catch (error) {
            console.log("Error creating attendance:", error);
            toast.error("Something went wrong", {
                description: "Please try again later",
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={cn(buttonVariants())}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Attendance
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[96%]">
                <DialogHeader>
                    <DialogTitle>Record Attendance</DialogTitle>
                    <DialogDescription>Add a new attendance record for the congregation</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date Of Attendance</FormLabel>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="attendance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Attendance Count</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter attendance number"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="flex-1"
                                >
                                    {isSubmitting ? "Recording..." : "Record Attendance"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
