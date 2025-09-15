"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getDaysInMonth } from "@/lib/utils";
import { getAttendance, saveAttendance } from "@/lib/actions/attendance.action";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type Person = {
    _id: string;
    fullName: string;
};

type MonthlyAttendanceTableProps = {
    people: Person[];
    type: "Student" | "Employee";
    classId: string;
};

export default function MonthlyAttendanceTable({ people, type, classId }: MonthlyAttendanceTableProps) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [attendance, setAttendance] = useState<Record<string, Record<number, boolean>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const daysInMonth = getDaysInMonth(year, month);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const response = await getAttendance(classId, year, month);
                console.log(response, "response");

                if (!response) throw new Error("Failed to fetch attendance");

                const newAttendance: Record<string, Record<number, boolean>> = {};

                people.forEach(person => {
                    const record = response.find((rec: { userId: string; records: Record<number, boolean> }) => rec.userId === person._id);
                    console.log(record, "person");
                    newAttendance[person._id] = {};

                    for (let day = 1; day <= daysInMonth; day++) {
                        newAttendance[person._id][day] =
                            record && record.records
                                ? Boolean(record.records[day]) // Ensure it correctly checks attendance
                                : false;
                    }
                });

                setAttendance(newAttendance);
            } catch (error) {
                console.error("Error fetching attendance:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [year, month, people, daysInMonth]);


    const handleAttendanceChange = (personId: string, day: number, present: boolean) => {
        setAttendance((prev) => ({
            ...prev,
            [personId]: {
                ...prev[personId],
                [day]: present,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await saveAttendance({ attendance, type, year, month, classId });

        if (response.success) {
            alert("Attendance submitted successfully!");
            router.refresh();
            toast({
                title: "Attendance submitted successfully",
                description: "Attendance submitted successfully for the selected month.",
            })
        } else {
            alert("Failed to submit attendance");
        }
    };

    return (
        <Card className="py-4">
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Year & Month Select */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        <Select value={year.toString()} onValueChange={(value) => setYear(Number(value))}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(10)].map((_, i) => (
                                    <SelectItem key={i} value={(new Date().getFullYear() - 5 + i).toString()}>
                                        {new Date().getFullYear() - 5 + i}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={month.toString()} onValueChange={(value) => setMonth(Number(value))}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(12)].map((_, i) => (
                                    <SelectItem key={i} value={(i + 1).toString()}>
                                        {new Date(0, i).toLocaleString("default", { month: "long" })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Attendance Table */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="overflow-auto max-w-[65rem]">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border px-4 py-2 text-left">Name</th>
                                            {[...Array(daysInMonth)].map((_, day) => (
                                                <th key={day} className="border px-2 py-2 text-center min-w-[40px]">{day + 1}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {people.map((person) => (
                                            <tr key={person._id} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2 w-20">{person.fullName}</td>
                                                {[...Array(daysInMonth)].map((_, day) => (
                                                    <td key={day} className="border px-2 py-2 text-center">
                                                        <Checkbox
                                                            checked={attendance[person._id]?.[day + 1] || false}
                                                            onCheckedChange={(checked) => handleAttendanceChange(person._id, day + 1, checked as boolean)}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table >
                            </div >
                        </div >
                    )
                    }

                    {/* Submit Button */}
                    <div className="text-right">
                        <Button disabled={isLoading} type="submit">
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? "Please wait..." : "Mark"}
                        </Button>
                    </div>
                </form >
            </CardContent >
        </Card >
    );
}
