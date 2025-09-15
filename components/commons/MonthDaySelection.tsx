"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import moment from "moment";
import { useState } from "react";

interface DateSelectionProps {
    selectedDate: (value: Date) => void;
}

const DateSelection = ({ selectedDate }: DateSelectionProps) => {
    const today = new Date();
    const [selected, setSelected] = useState(today);

    const handleDateChange = (value: Date | undefined) => {
        if (value) {
            setSelected(value);
            selectedDate(value);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2 items-center">
                    <CalendarDays className="w-4 h-4" />
                    {moment(selected).format("MMMM Do, YYYY")}
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(value) => handleDateChange(value ?? today)}
                    className="rounded-md flex flex-1 justify-center"
                />
            </PopoverContent>
        </Popover>
    );
};

export default DateSelection;
