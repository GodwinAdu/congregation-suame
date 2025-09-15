"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { addMonths, format } from "date-fns";
import { CalendarDays } from "lucide-react";
import {  useState } from "react";

interface MonthSelectionProps {
    selectedMonth: (value: Date) => void;
}

const MonthSelection = ({ selectedMonth }: MonthSelectionProps) => {
    const today = new Date();
    const nextMonth = addMonths(today, 0);
    const [month, setMonth] = useState(nextMonth);

    const handleMonthChange = (value: Date) => {
        setMonth(value);
        selectedMonth(value);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2 items-center">
                    <CalendarDays className="w-4 h-4" />
                    {format(month, "MMMM yyyy")}
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Calendar
                    mode="single"
                    month={month}
                    onMonthChange={handleMonthChange}
                    className="rounded-md flex flex-1 justify-center"
                />
            </PopoverContent>
        </Popover>
    );
};

export default MonthSelection;
