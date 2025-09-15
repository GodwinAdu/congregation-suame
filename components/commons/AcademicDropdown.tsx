"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { updateSessionStatusWithId } from "@/lib/actions/session.actions"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Checked = DropdownMenuCheckboxItemProps["checked"]

export function AcademicDropdown({ sessions }: { sessions: ISession[] }) {
    const [selectedSession, setSelectedSession] = useState<string | null>(null)

    const router = useRouter()

    // Function to update session status in the database
    const updateSessionStatus = async (sessionId: string) => {
        try {
            setSelectedSession(sessionId)
            const response = await updateSessionStatusWithId(sessionId)
            console.log(response,"response")
            router.refresh();
            toast({
                title: "Session updated successfully",
                description: `The session have updated, The Current Academic year is ${response.period}`
            })
        } catch (error) {
            toast({
                title: "Something went wrong",
                description: "Please try again later...",
                variant: "destructive",
            })
            console.error("Error updating session status:", error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Calendar className='w-4 h-4' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Academic year</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sessions.length === 0 ? (
                    <DropdownMenuCheckboxItem disabled>
                        No sessions found
                    </DropdownMenuCheckboxItem>
                ) : (
                    sessions.map((session) => (
                        <DropdownMenuCheckboxItem
                            key={session._id}
                            checked={selectedSession === session._id || session.endDate >= new Date(Date.now())}
                            onCheckedChange={() => {
                                updateSessionStatus(session?._id as string) // Update database and UI
                            }}
                        >
                            {session.session} ({session.term})
                        </DropdownMenuCheckboxItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
