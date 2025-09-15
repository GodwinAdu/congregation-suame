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
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPrivilege } from "@/lib/actions/privilege.actions";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "name must be at least 2 characters.",
    }),
});

export function PrivilegeModal() {
    const router = useRouter();
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const { isSubmitting } = form.formState;

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await createPrivilege(values)
            router.refresh();
            form.reset();
            toast.success("New privilege created", {
                description: "New house was added successfully...",
            });
        } catch (error) {
            console.log("error happened while creating privilege", error);
            toast.error("Something went wrong", {
                description: "Please try again later...",
            });
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className={cn(buttonVariants())}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[96%]">
                <DialogHeader>
                    <DialogTitle>New Privilege</DialogTitle>
                    <DialogDescription>Create congregation privilege .</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Enter Group Name</FormLabel>
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
                            {/* <FormField
                                control={form.control}
                                name="roomIds"
                                defaultValue={[]} // Initialize as an empty array
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mark Distribution</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                placeholder="Mark Distributions"
                                                data={rooms}
                                                value={field.value || []} // Ensure value is an array
                                                onChange={(room) =>
                                                    field.onChange([...field.value, room])
                                                }
                                                onRemove={(idToRemove) =>
                                                    field.onChange(field.value.filter(
                                                        (roomId) => roomId !== idToRemove
                                                    ))
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-1" />
                                    </FormItem>
                                )}
                            /> */}

                            <Button disabled={isSubmitting} type="submit">
                                {isSubmitting ? "Creating..." : "Submit"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
