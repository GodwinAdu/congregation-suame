
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DepartmentSelectionProps {
    departments: IDepartment[],
    selectedDepartment: (value: string) => void;
}
const DepartmentSelection = ({ selectedDepartment, departments }: DepartmentSelectionProps) => {

    return (
        <>
            <Select
                onValueChange={(value) => selectedDepartment(value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={departments[0].name} />
                </SelectTrigger>
                <SelectContent>
                    {departments?.map((department) => (
                        <SelectItem key={department._id} value={department._id ?? ""}>
                            {department.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>


        </>
    )
}

export default DepartmentSelection