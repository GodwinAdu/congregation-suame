"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { PlusCircle, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPrivilege, updatePrivilege } from "@/lib/actions/privilege.actions";
import { useState } from "react";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "name must be at least 2 characters.",
    }),
    excludeFromActivities: z.boolean().default(false),
});

interface PrivilegeModalProps {
    privilege?: any;
}

export function PrivilegeModal({ privilege }: PrivilegeModalProps) {
    const router = useRouter();
    // 1. Define your form.
    const [open, setOpen] = useState(false);
    const isEditing = !!privilege;
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: privilege?.name || "",
            excludeFromActivities: privilege?.excludeFromActivities || false,
        },
    });

    const { isSubmitting } = form.formState;

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (isEditing) {
                await updatePrivilege(privilege._id, values);
                toast.success("Privilege updated successfully");
            } else {
                await createPrivilege(values);
                toast.success("New privilege created successfully");
            }
            router.refresh();
            form.reset();
            setOpen(false);
        } catch (error) {
            console.log("error happened while saving privilege", error);
            toast.error("Something went wrong", {
                description: "Please try again later...",
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm transition-colors">
                        <Edit className="h-4 w-4" />
                        Edit
                    </button>
                ) : (
                    <Button className={cn(buttonVariants())}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Privilege
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[96%]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Privilege' : 'New Privilege'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update privilege information' : 'Create congregation privilege'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Enter Privilege Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Eg. Elder"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="excludeFromActivities"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Exclude from Activities
                                            </FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Members with this privilege will not appear in assignment lists (e.g., for children)
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <Button disabled={isSubmitting} type="submit">
                                {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : "Submit"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
